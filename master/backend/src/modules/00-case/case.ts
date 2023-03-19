import { Emitter } from "../../events"
import { fillArray, fillSpecialArray, iterateEnum, notUndefined } from "../../helper"
import { SpecificModuleEvents, SpecificModule } from "../specificModule"
import { ModuleType } from "../../../../common/types/module"
import { CaseConfiguration, indicatorTextValues, portKeys, portType, serialNumberType } from "../../../../common/types/modules/case"
import { ConfigurationError, ConfigurationErrorType } from "../configurationError"


// EVENTS
export type CaseEvents = SpecificModuleEvents<CaseConfiguration>

export type CaseConfigType = {
    serialNumber: "READ" | "WRITE" | "UNKNOWN",
    batteries: "READ" | "UNKNOWN",
    indicatorText: "READ" | "WRITE" | "UNKNOWN",
    indicatorLed: "WRITE",
    ports: "READ" | "UNKNOWN",
}

export abstract class Case extends SpecificModule<CaseConfiguration> {

    public readonly emitter: Emitter<CaseEvents> = new Emitter

    abstract readonly types: CaseConfigType;

    constructor(
        version: number,
        pos: number,

        readonly config: Readonly<{
            serialNumberPossibilities: serialNumberType[],
            batteryLength: number,
            indicatorLength: number,
            // indicatorsPossible: { type: Exclude<indicatorText, indicatorText.Empty>, amount: number }[],
            portsPossible: portType,
        }>
    ) {
        super(ModuleType.Case, version, pos)
    }

    // STATE - TARGET

    protected validateConfig(config: Partial<CaseConfiguration>): void {
        if (notUndefined(config.serialNumber) && !this.config.serialNumberPossibilities.includes(config.serialNumber))
            throw new ConfigurationError(ConfigurationErrorType.ConfigNotPossible, "serialNumber")
        if (notUndefined(config.batteries) && config.batteries.length !== this.config.batteryLength)
            throw new ConfigurationError(ConfigurationErrorType.ArrayLengthMismatch, "batteries")
        if (notUndefined(config.indicatorText) && config.indicatorText.length !== this.config.indicatorLength)
            throw new ConfigurationError(ConfigurationErrorType.ArrayLengthMismatch, "indicatorText")
        if (notUndefined(config.indicatorLed) && config.indicatorLed.length !== this.config.indicatorLength)
            throw new ConfigurationError(ConfigurationErrorType.ArrayLengthMismatch, "indicatorLed")
        if (notUndefined(config.ports)) {
            for (const port of iterateEnum(portKeys)) {
                if (config.ports[port] && !this.config.portsPossible[port]) {
                    throw new ConfigurationError(ConfigurationErrorType.ConfigNotPossible, "ports", port)
                }
            }
        }
    }

    public configGenerate(): CaseConfiguration {
        // choose random serialnumber 
        const serialNumber = this.config.serialNumberPossibilities[Math.floor(Math.random() * this.config.serialNumberPossibilities.length)]

        // choose random indicator text
        const arrayOfIndicatorTextValues = Object.values(indicatorTextValues)
        const indicatorText = Array.from({ length: this.config.indicatorLength }, () => arrayOfIndicatorTextValues[Math.floor(Math.random() * arrayOfIndicatorTextValues.length)])

        // generate random indicator led status 
        const indicatorLed = Array.from({ length: this.config.indicatorLength }, () => Math.random() >= 0.5)

        // generate random batteries, more batteries are less likely
        let batteryCount: number
        do {
            batteryCount = 0
            while (Math.random() < 0.8) { batteryCount++ }
        } while (batteryCount > this.config.batteryLength)

        const batteries = fillSpecialArray(this.config.batteryLength, false, fillArray(batteryCount, true))

        // generate random ports
        const ports: portType = {
            "DVI-D": Math.random() >= 0.5 && this.config.portsPossible["DVI-D"],
            "Parallel": Math.random() >= 0.5 && this.config.portsPossible["Parallel"],
            "PS/2": Math.random() >= 0.5 && this.config.portsPossible["PS/2"],
            "RJ-45": Math.random() >= 0.5 && this.config.portsPossible["RJ-45"],
            "Cinch": Math.random() >= 0.5 && this.config.portsPossible["Cinch"],
            "Serial": Math.random() >= 0.5 && this.config.portsPossible["Serial"],
        }

        return {
            serialNumber,
            indicatorText,
            indicatorLed,
            batteries,
            ports
        }
    }

    // PLAY

    protected setPlayState(): void {
        // nothing to do
    }

    public serialNumberHasVocal(): boolean {
        //TODO use state
        return /[aeiou]/i.test(this.getTarget().serialNumber!)
    }

    public serialNumberLastDigitIsEven(): boolean {
        //TODO use state
        return /[02468]$/.test(this.getTarget().serialNumber!)
    }
}
