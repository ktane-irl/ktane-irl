import { ClockConfigType, ClockModule } from "./clock"

export enum CM01Commands {
    gameTimeLeftAndErrors = 0x01,
}

export class Cm01 extends ClockModule {

    readonly types: ClockConfigType = {
        strikeLed: "WRITE",
        secondsLeft: "WRITE",
    }

    constructor(pos: number) {
        super(1, pos)

        this.emitter.on("strikeLedTargetChange", () => this.updateSecondsLeftAndStrikeLeds(false))
        this.emitter.on("secondsLeftTargetChange", () => this.updateSecondsLeftAndStrikeLeds(false))

    }

    // SPI
    protected update(force = false) {
        this.updateSecondsLeftAndStrikeLeds(force)
    }

    updateSecondsLeftAndStrikeLeds(force: boolean) {
        if (!this.isDirty("secondsLeft", force) && !this.isDirty("strikeLed", force)) return
        const targetSecondsLeft = this.getIfDirty("secondsLeft", true) || 0
        const targetStrikeLed = this.getIfDirty("strikeLed", true) || [false, false]

        // send to spi
        this.sendMessage({
            cmd: CM01Commands.gameTimeLeftAndErrors, data:
                [ // 0bLR__TTTT 0bTTTTTTTT
                    (targetStrikeLed[0] ? 0b10000000 : 0) | (targetStrikeLed[1] ? 0b01000000 : 0) | (targetSecondsLeft >> 8),
                    targetSecondsLeft & 0xFF
                ]
        })
        // update state
        this.setState("secondsLeft", targetSecondsLeft)
        this.setState("strikeLed", targetStrikeLed)
    }

    moduleReceivedMessage(): boolean {
        return false
    }
}
