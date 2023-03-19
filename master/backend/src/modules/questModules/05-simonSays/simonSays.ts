import { ModuleType } from "../../../../../common/types/module"
import { Emitter } from "../../../events"
import { QuestModule, QuestModuleConfigType, QuestModuleEvents } from "../questModule"
import { SimonSaysColor, SimonSaysConfiguration } from "../../../../../common/types/modules/questModules/simonSays"
import { QuestConfiguration } from "../../../../../common/types/modules/questModules/quest"
import { fillRandomArray, iterateEnum } from "../../../helper"

// EVENTS
export type SimonSaysEvents = QuestModuleEvents<SimonSaysConfiguration>

export type SimonSaysConfigType = QuestModuleConfigType & {
    led: "WRITE"
    button: "READ"
    sequence: "INTERNAL"
    sequenceLength: "INTERNAL"
}

export abstract class SimonSays extends QuestModule<SimonSaysConfiguration> {

    public readonly emitter: Emitter<SimonSaysEvents> = new Emitter

    abstract readonly types: SimonSaysConfigType

    constructor(
        version: number,
        pos: number,
    ) {
        super(ModuleType.SimonSays, version, pos)
    }

    // STATE - TARGET

    protected validateConfig(): void { return }

    public configGenerate(): SimonSaysConfiguration & QuestConfiguration {
        // sequence length is 20% 3, 60% 4, 20% 5
        const sequenceLength = [3, 4, 4, 4, 5][Math.floor(Math.random() * 5)]

        // sequence is of random colors
        const sequence: SimonSaysColor[] = fillRandomArray(sequenceLength, [SimonSaysColor.red, SimonSaysColor.green, SimonSaysColor.yellow, SimonSaysColor.blue])

        return {
            statusLed: { red: false, green: false },
            led: {
                red: false,
                green: false,
                yellow: false,
                blue: false,
            },
            button: {
                red: false,
                green: false,
                yellow: false,
                blue: false,
            },
            sequence,
            sequenceLength,
        }
    }

    // PLAY

    private clockTimeout: NodeJS.Timeout | undefined
    private setNextTick(timeout: number | null) {
        if (this.clockTimeout) clearTimeout(this.clockTimeout)
        this.logger.log("setNextTick", timeout)
        if (timeout !== null)
            this.clockTimeout = setTimeout(() => this.tick(), timeout)
        else
            this.clockTimeout = undefined
    }
    private tickSequence: (SimonSaysColor | "off")[] | undefined
    private tick() {

        if (!this.tickSequence) {
            // generate sequence from target sequence and state sequenceLength
            const sequence = this.getTarget().sequence!
            const sequenceLength = this.getState().sequenceLength!
            this.tickSequence = sequence.slice(0, sequenceLength + 1).map(color => [color, "off"] as const).flat()
        }

        // show next event
        const nextEvent = this.tickSequence.shift()!
        this.logger.log("tick", nextEvent, this.tickSequence)
        this.setTarget({
            led: {
                red: nextEvent === SimonSaysColor.red,
                green: nextEvent === SimonSaysColor.green,
                yellow: nextEvent === SimonSaysColor.yellow,
                blue: nextEvent === SimonSaysColor.blue,
            }
        })

        // check if sequence is finished
        if (this.tickSequence.length === 0) {
            // reset sequence
            this.tickSequence = undefined
            this.setNextTick(5000)
        } else {
            // continue sequence
            this.setNextTick(500)
        }
    }

    protected setPlayState(): void {
        // reset state
        this.setState("sequence", [])
        this.setState("sequenceLength", 0)

        // start timer
        this.setNextTick(5000)
        this.addPlayDisposable(() => {
            this.setNextTick(null)
        })

        // button press event
        this.addPlayDisposable(this.emitter.on("buttonStateChange", (now, old) => {

            // set led to button state
            this.setTarget({ led: now })

            // check if already solved
            if (this.isSolved()) return

            this.logger.log("processing button press", now, old)
            if (!old) throw new Error("old button state not defined")

            // check if button is pressed
            const pressed = iterateEnum(SimonSaysColor).find(color => now[color] && !old[color])
            if (!pressed) return

            // reset timer
            this.setNextTick(5000)
            this.tickSequence = undefined

            // add pressed button to sequence
            const sequence = this.getState().sequence || []
            sequence.push(pressed)
            this.setState("sequence", sequence)
        }).off)
        // all LEDs off when exiting play mode
        this.addPlayDisposable(() => {
            this.setTarget({ led: { blue: false, green: false, red: false, yellow: false } })
        })

        // sequence change event
        this.addPlayDisposable(this.emitter.on("sequenceStateChange", (now) => {
            if (now.length === 0) return

            // get correct sequence
            const seqDisplayed = this.getTarget().sequence!
            const serialNumberHasVocal = this.getCase().serialNumberHasVocal()
            const strikes = this.getClock().getStrikes()

            let translation: Record<SimonSaysColor, SimonSaysColor>
            if (serialNumberHasVocal) {
                switch (strikes) {
                    case 0: translation = {
                        red: SimonSaysColor.blue,
                        blue: SimonSaysColor.red,
                        green: SimonSaysColor.yellow,
                        yellow: SimonSaysColor.green,
                    }; break
                    case 1: translation = {
                        red: SimonSaysColor.yellow,
                        blue: SimonSaysColor.green,
                        green: SimonSaysColor.blue,
                        yellow: SimonSaysColor.red,
                    }; break
                    case 2: translation = {
                        red: SimonSaysColor.green,
                        blue: SimonSaysColor.red,
                        green: SimonSaysColor.yellow,
                        yellow: SimonSaysColor.blue,
                    }; break
                    default: throw new Error("invalid strikes")
                }
            } else {
                switch (strikes) {
                    case 0: translation = {
                        red: SimonSaysColor.blue,
                        blue: SimonSaysColor.yellow,
                        green: SimonSaysColor.green,
                        yellow: SimonSaysColor.red,
                    }; break
                    case 1: translation = {
                        red: SimonSaysColor.red,
                        blue: SimonSaysColor.blue,
                        green: SimonSaysColor.yellow,
                        yellow: SimonSaysColor.green,
                    }; break
                    case 2: translation = {
                        red: SimonSaysColor.yellow,
                        blue: SimonSaysColor.green,
                        green: SimonSaysColor.blue,
                        yellow: SimonSaysColor.red,
                    }; break
                    default: throw new Error("invalid strikes")
                }
            }
            const seqCorrect = seqDisplayed.map(color => translation[color])

            // check if sequence is correct
            const isCorrect = now.every((color, i) => color === seqCorrect[i])
            this.logger.log("checking sequence", now, "against", seqCorrect, ":", isCorrect ? "correct" : "incorrect")

            if (isCorrect) {
                // if correct, check if sequence is complete
                const len = this.getState().sequenceLength!
                if (now.length > len) {
                    this.logger.log("sequence step complete")
                    this.setState("sequenceLength", len + 1)
                }
            } else {
                // if incorrect, reset sequence and add error
                this.setState("sequence", [])
                this.setNextTick(2000)
                this.handleFailed()
            }
        }).off)

        // sequence length change event
        this.addPlayDisposable(this.emitter.on("sequenceLengthStateChange", (now) => {

            // get sequence length
            const len = this.getTarget().sequenceLength!

            // check if sequence is complete
            if (now === len) {
                this.logger.log("sequence complete")
                this.handleSolved()
                this.setNextTick(null)
            } else {
                this.setState("sequence", [])
                this.setNextTick(2000)
            }
        }).off)

    }
}
