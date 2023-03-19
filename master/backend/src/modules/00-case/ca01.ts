import { portKeys } from "../../../../common/types/modules/case"
import { boolArrayToByte, byteToBoolArray } from "../../helper"
import { ModuleMessageType } from "../../types/spi"
import { SpiError, SpiErrorType } from "../../spiError"
import { Case, CaseConfigType } from "./case"

export enum Ca01Commands {
    indicatorSet = 0x01,
    batteryGet = 0x02,
}

export class Ca01 extends Case {

    readonly types: CaseConfigType = {
        serialNumber: "UNKNOWN",
        indicatorText: "UNKNOWN",
        indicatorLed: "WRITE",
        batteries: "READ",
        ports: "UNKNOWN",
    }

    constructor(pos: number) {
        super(1, pos, {
            serialNumberPossibilities: [
                "AL50F2", // vocal: YES, lastDigit: EVEN
                "JG0IZ1", // vocal: YES, lastDigit:  ODD
                "RJ7LR9", // vocal:  NO, lastDigit:  ODD
                "831NS4", // vocal:  NO, lastDigit: EVEN
            ],
            batteryLength: 6,
            indicatorLength: 5,
            portsPossible: {
                [portKeys.DVI_D]: false,
                [portKeys.Parallel]: true,
                [portKeys.PS_2]: false,
                [portKeys.RJ_45]: false,
                [portKeys.Serial]: false,
                [portKeys.Cinch]: false,
            },
        })

        this.emitter.on("indicatorLedTargetChange", () => this.updateIndicatorLeds(false))
    }

    // SPI
    protected update(force = false) {
        this.updateIndicatorLeds(force)
    }
    updateIndicatorLeds(force: boolean) {
        const target = this.getIfDirty("indicatorLed", force)
        if (target === undefined) return

        // send to spi
        this.sendMessage({ cmd: Ca01Commands.indicatorSet, data: [boolArrayToByte(target)] })
        // update state
        this.setState("indicatorLed", target)
    }


    moduleReceivedMessage(msg: ModuleMessageType): boolean {
        switch (msg.cmd) {
            case Ca01Commands.batteryGet:
                msg.data.shift()//! remove the first byte
                if (msg.data.length !== 1)
                    throw new SpiError(SpiErrorType.InvalidDataLengthFromModule)
                this.setState("batteries", byteToBoolArray(msg.data[0], this.config.batteryLength))
                return true
        }
        return false
    }
}
