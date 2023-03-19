import { Emitter } from "../../events"
import { notUndefined } from "../../helper"
import { SpecificModuleEvents, SpecificModule } from "../specificModule"
import { ModuleType } from "../../../../common/types/module"
import { ClockConfiguration } from "../../../../common/types/modules/clock"
import { ConfigurationError, ConfigurationErrorType } from "../configurationError"
import { gameConfig } from "../../gamemaster"
import { playSound, Sounds } from "../../audioController"

// EVENTS
export type ClockEvents = {
    strikesChanged: (strikes: number) => void;
    timeElapsed: () => void;
} & SpecificModuleEvents<ClockConfiguration>

export type ClockConfigType = {
    secondsLeft: "WRITE",
    strikeLed: "WRITE",
}

export abstract class ClockModule extends SpecificModule<ClockConfiguration> {

    public readonly emitter: Emitter<ClockEvents> = new Emitter

    abstract readonly types: ClockConfigType;

    constructor(
        version: number,
        pos: number,
    ) {
        super(ModuleType.ClockModule, version, pos)
    }

    // STATE - TARGET

    protected validateConfig(config: Partial<ClockConfiguration>): void {
        if (notUndefined(config.secondsLeft) && config.secondsLeft < 0 && config.secondsLeft >= (2 << 12))
            throw new ConfigurationError(ConfigurationErrorType.ConfigNotPossible, "secondsLeft")
        if (notUndefined(config.strikeLed) && config.strikeLed.length !== 2)
            throw new ConfigurationError(ConfigurationErrorType.ArrayLengthMismatch, "strikeLed")
    }

    public configGenerate(): ClockConfiguration {
        return {
            secondsLeft: gameConfig.seconds,
            strikeLed: [false, false], //TODO maxStrikes
        }
    }

    // PLAY

    public getStrikes(): number {
        const strikeLed = this.getState().strikeLed!
        return strikeLed[0] ? (strikeLed[1] ? 2 : 1) : 0
    }

    private strikesToClockInterval(strikes: number): number {
        switch (strikes) {
            case 0: return 1000
            case 1: return 800
            default: return 650
        }
    }

    public addStrike() {
        const strikes = this.getStrikes() + 1

        // show strikes
        this.setTarget({ strikeLed: [strikes >= 1, strikes >= 2] })

        // change clock speed
        clearInterval(this.clockInterval!)
        this.clockInterval = setInterval(() => { this.tick() }, this.strikesToClockInterval(strikes))

        // emit strikes changed
        this.emitter.emit("strikesChanged", strikes)
    }

    private clockInterval: NodeJS.Timeout | undefined

    private tick(): void {
        let secondsLeft = this.getState().secondsLeft!
        if (secondsLeft > 0) secondsLeft--
        this.setTarget({ secondsLeft: secondsLeft })

        if (secondsLeft === 0) {
            this.emitter.emit("timeElapsed")
        } else {
            playSound(Sounds.TICK)
        }
    }

    protected setPlayState(): void {
        this.clockInterval = setInterval(() => { this.tick() }, this.strikesToClockInterval(0))
        this.addPlayDisposable(() => {
            clearInterval(this.clockInterval!)
            this.clockInterval = undefined
        })
    }
}
