import { ModuleType } from "../../../../../common/types/module"
import { Emitter } from "../../../events"
import { fillSpecialArray, notUndefined } from "../../../helper"
import { ConfigurationError, ConfigurationErrorType } from "../../configurationError"
import { QuestModule, QuestModuleConfigType, QuestModuleEvents } from "../questModule"
import { wireColor, wireCount, WiresConfiguration } from "../../../../../common/types/modules/questModules/wires"
import { QuestConfiguration } from "../../../../../common/types/modules/questModules/quest"

// EVENTS
export type WiresEvents = QuestModuleEvents<WiresConfiguration>

export type WiresConfigType = QuestModuleConfigType & {
    wiresColor: "READ"
}

export abstract class Wires extends QuestModule<WiresConfiguration> {

    public readonly emitter: Emitter<WiresEvents> = new Emitter

    abstract readonly types: WiresConfigType

    constructor(
        version: number,
        pos: number,
    ) {
        super(ModuleType.Wires, version, pos)
    }


    // STATE - TARGET

    protected validateConfig(config: Partial<WiresConfiguration>): void {
        // if (notUndefined(config.wiresConnected) && config.wiresConnected.length !== wireCount)
        //     throw new ConfigurationError(ConfigurationErrorType.ArrayLengthMismatch, "wireConnected")
        if (notUndefined(config.wiresColor) && config.wiresColor.length !== wireCount)
            throw new ConfigurationError(ConfigurationErrorType.ArrayLengthMismatch, "wireColor")
    }

    public configGenerate(): WiresConfiguration & QuestConfiguration {
        // wire count from 3 to 6
        const wiresAmount = Math.floor(Math.random() * 4) + 3

        //wire color possibilities
        const wireColorPossibilities = [wireColor.black, wireColor.blue, wireColor.red, wireColor.yellow, wireColor.white]
        // wire colors
        const wiresColor = Array.from({ length: wiresAmount }, () => wireColorPossibilities[Math.floor(Math.random() * wireColorPossibilities.length)])

        // put wires on random positions
        const wColors = fillSpecialArray(wireCount, wireColor.not_connected, wiresColor)

        return {
            statusLed: { red: false, green: false },
            wiresColor: wColors,
        }
    }

    // PLAY
    protected setPlayState() {
        // wire change event
        this.addPlayDisposable(this.emitter.on("wiresColorStateChange", (wiresNow, wiresOld) => {
            this.logger.log("processing wire change", wiresNow, wiresOld)

            if (!wiresOld) throw new Error("wiresOld is undefined")
            // check if wire was cut
            const changedWire = wiresNow.findIndex((w, i) => w !== wiresOld[i])
            if (changedWire === -1) { this.logger.warn("No wire changed"); return }
            if (wiresNow[changedWire] !== wireColor.not_connected) { this.logger.warn("Wire was not cut"); return }

            const serialNumber = this.getCase().getTarget().serialNumber! //TODO use state
            const lastNumber = Number(serialNumber[serialNumber.length - 1])

            // calculate correct wire to be cut
            const w = this.getTarget().wiresColor!.map((c, i) => ({ c, i })).filter(w => w.c !== wireColor.not_connected)
            let cutIndex: number
            switch (w.length) {
                case 3:
                    // if there are no red wires, cut the second wire.
                    if (w.filter(w => w.c === wireColor.red).length === 0) {
                        cutIndex = w[1].i
                    }
                    // Otherwise, if the last wire is white, cut the last wire.
                    else if (w[w.length - 1].c === wireColor.white) {
                        cutIndex = w[w.length - 1].i
                    }
                    // Otherwise, if there is more than one blue wire, cut the last blue wire.
                    else if (w.filter(w => w.c === wireColor.blue).length > 1) {
                        cutIndex = w.filter(w => w.c === wireColor.blue).pop()!.i
                    }
                    // Otherwise, cut the last wire.
                    else {
                        cutIndex = w[w.length - 1].i
                    }
                    break
                case 4:
                    // If there is more than one red wire and the last digit of the serial number is odd, cut the last red wire.
                    if (w.filter(w => w.c === wireColor.red).length > 1 && lastNumber % 2 === 1) {
                        cutIndex = w.filter(w => w.c === wireColor.red).pop()!.i
                    }
                    // Otherwise, if the last wire is yellow and there are no red wires, cut the first wire.
                    else if (w[w.length - 1].c === wireColor.yellow && w.filter(w => w.c === wireColor.red).length === 0) {
                        cutIndex = w[0].i
                    }
                    // Otherwise, if there is exactly one blue wire, cut the first wire.
                    else if (w.filter(w => w.c === wireColor.blue).length === 1) {
                        cutIndex = w[0].i
                    }
                    // Otherwise, if there is more than one yellow wire, cut the last wire.
                    else if (w.filter(w => w.c === wireColor.yellow).length > 1) {
                        cutIndex = w[w.length - 1].i
                    }
                    // Otherwise, cut the second wire.
                    else {
                        cutIndex = w[1].i
                    }
                    break
                case 5:
                    // If the last wire is black and the last digit of the serial number is odd, cut the fourth wire.
                    if (w[w.length - 1].c === wireColor.black && lastNumber % 2 === 1) {
                        cutIndex = w[3].i
                    }
                    // Otherwise, if there is exactly one red wire and there is more than one yellow wire, cut the first wire.
                    else if (w.filter(w => w.c === wireColor.red).length === 1 && w.filter(w => w.c === wireColor.yellow).length > 1) {
                        cutIndex = w[0].i
                    }
                    // Otherwise, if there are no black wires, cut the second wire.
                    else if (w.filter(w => w.c === wireColor.black).length === 0) {
                        cutIndex = w[1].i
                    }
                    // Otherwise, cut the first wire.
                    else {
                        cutIndex = w[0].i
                    }
                    break
                case 6:
                    // If there are no yellow wires and the last digit of the serial number is odd, cut the third wire.
                    if (w.filter(w => w.c === wireColor.yellow).length === 0 && lastNumber % 2 === 1) {
                        cutIndex = w[2].i
                    }
                    // Otherwise, if there is exactly one yellow wire and there is more than one white wire, cut the fourth wire.
                    else if (w.filter(w => w.c === wireColor.yellow).length === 1 && w.filter(w => w.c === wireColor.white).length > 1) {
                        cutIndex = w[3].i
                    }
                    // Otherwise, if there are no red wires, cut the last wire.
                    else if (w.filter(w => w.c === wireColor.red).length === 0) {
                        cutIndex = w[w.length - 1].i
                    }
                    // Otherwise, cut the fourth wire.
                    else {
                        cutIndex = w[3].i
                    }
                    break
                default:
                    throw new Error("Invalid number of wires")
            }

            // check if the correct wire was cut
            if (wiresNow[cutIndex] === wireColor.not_connected) {
                this.handleSolved()
            } else {
                this.handleFailed()
            }
        }).off)
    }
}
