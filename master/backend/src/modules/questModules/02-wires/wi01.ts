import { ModuleMessageType } from "../../../types/spi"
import { SpiError, SpiErrorType } from "../../../spiError"
import { Wires, WiresConfigType } from "./wires"
import { wireColorType } from "../../../../../common/types/modules/questModules/wires"

export enum Wi01Commands {
    colorsGet = 0x02,
}

function byteArrayToWireColor(byteArray: number[]): wireColorType {
    // each byte holds two colors, 0b00BBBAAA
    return byteArray.map(v => {
        const vA = v & 0b111
        const vB = (v >> 3) & 0b111
        return [vB, vA] as wireColorType
    }).flat().reverse()
}

export class Wi01 extends Wires {

    readonly types: WiresConfigType = {
        statusLed: "WRITE",
        wiresColor: "READ",
    }

    constructor(pos: number) {
        super(1, pos)
        this.emitter.on("statusLedTargetChange", () => this.updateStatusLed(false))
    }

    // SPI
    protected update(force = false) {
        this.updateStatusLed(force)
    }

    moduleReceivedMessage(msg: ModuleMessageType): boolean {
        switch (msg.cmd) {
            case Wi01Commands.colorsGet:
                {
                    msg.data.shift()//! remove the first byte
                    if (msg.data.length !== 3)
                        throw new SpiError(SpiErrorType.InvalidDataLengthFromModule, `Wi01.colorsGet ${msg.data.length} != 3`)
                    const colors = byteArrayToWireColor(msg.data)
                    // this.setState("wiresConnected", colors.map(c => c != wireColor.not_connected));
                    this.setState("wiresColor", colors)
                }
                return true
            default:
                return false
        }
    }
}
