import { ModuleMessageType } from "../../../types/spi"
import { SpiError, SpiErrorType } from "../../../spiError"
import { SimonSays, SimonSaysConfigType } from "./simonSays"
import { LedType } from "../../../../../common/types/modules/questModules/simonSays"

export enum Ss01Commands {
    LedsSet = 0x02,
    ButtonsGet = 0x03,
}

export class Ss01 extends SimonSays {
    readonly types: SimonSaysConfigType = {
        statusLed: "WRITE",
        led: "WRITE",
        button: "READ",
        sequence: "INTERNAL",
        sequenceLength: "INTERNAL",
    }

    constructor(pos: number) {
        super(1, pos)
        this.emitter.on("statusLedTargetChange", () => this.updateStatusLed(false))
        this.emitter.on("ledTargetChange", () => this.updateLeds(false))

        // // ! DEBUG
        // this.emitter.on("buttonStateChange", (state, old) => {
        //     console.log("DEBUG", state);
        //     this.setTarget({ led: state })
        // });
    }

    // SPI
    protected update(force = false) {
        this.updateStatusLed(force)
        this.updateLeds(force)
    }

    updateLeds(force: boolean) {
        const target = this.getIfDirty("led", force)
        if (target === undefined) return

        // send to spi
        this.sendMessage({
            cmd: Ss01Commands.LedsSet, data: [
                (target.red ? 0b0001 : 0) |
                (target.green ? 0b0010 : 0) |
                (target.yellow ? 0b0100 : 0) |
                (target.blue ? 0b1000 : 0)
            ]
        })
        // update state
        this.setState("led", target)
    }

    moduleReceivedMessage(msg: ModuleMessageType): boolean {
        switch (msg.cmd) {
            case Ss01Commands.ButtonsGet:
                {
                    msg.data.shift()//! remove the first byte
                    if (msg.data.length !== 1)
                        throw new SpiError(SpiErrorType.InvalidDataLengthFromModule, `Ss01.ButtonsGet ${msg.data.length} != 1`)
                    const colors: LedType = {
                        red: (msg.data[0] & 0b0001) != 0,
                        green: (msg.data[0] & 0b0010) != 0,
                        yellow: (msg.data[0] & 0b0100) != 0,
                        blue: (msg.data[0] & 0b1000) != 0,
                    }
                    this.setState("button", colors)
                }
                return true
            default:
                return false
        }
    }
}
