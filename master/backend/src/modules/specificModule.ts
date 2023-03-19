/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ConfigTypes, Configuration, ModuleType, SpiModulePosition } from "../../../common/types/module"
import { Emitter } from "../events"
import { SpiMessageToString, ModuleMessageType } from "../types/spi"
import { Module, ModuleCommands } from "./module"
import { SpiError, SpiErrorType } from "../spiError"
import { ModuleLogger } from "../logger"
import { GameState } from "../types/game"
import { SpecificModuleEvents } from "./moduleTypes"

export { SpecificModuleEvents }

export abstract class SpecificModule<C extends Configuration> extends Module {
    abstract readonly types: ConfigTypes<C>;

    private state: Partial<C> = {} // the actual state of the modules settings
    private target: Partial<C> = {} // the target the states should be (used for SETUP)

    public abstract readonly emitter: Emitter<SpecificModuleEvents<C>>;

    constructor(
        public readonly type: ModuleType,
        public readonly version: number,
        public readonly pos: SpiModulePosition
    ) {
        super()
        this.logger = new ModuleLogger(this.name, pos)
        this.logger.log(`Created ${this.name}`)
    }

    protected readonly logger: ModuleLogger

    private disposables: (() => void)[] = []
    protected addDisposable(disposable: () => void) { this.disposables.push(disposable) }
    public destroy() {
        this.logger.log(`Removed ${this.name}`)
        this.disposables.forEach(d => d())
        this.disposables = []
        this.playDisposables.forEach(d => d())
        this.playDisposables = []
    }

    //                                                     STATE
    /**
     * getter for current state of the module
     * @returns readonly state
     */
    public getState(): Readonly<Partial<C>> { return this.state }

    /**
     * define (set) the state of the module externally
     * only possible when the configType is UNKNOWN
     */
    public defineState<K extends keyof C>(key: K, state: C[K]) {
        if (this.types[key] !== "UNKNOWN") throw new Error(`Can't define state manually of ${key.toString()} because it is not of type UNKNOWN`)
        this.setState(key, state)
    }

    /**
     * set the state of the module
     * by defineState when UNKNOWN
     * by setTarget when WRITE (after target is sent to module)
     * in SpiModuleReceivedMessage when READ
     */
    protected setState<K extends keyof C>(key: K, state: C[K]) {
        const oldState = this.state[key]
        this.state[key] = state
        // this.logger.log(`State of ${key.toString()} changed to ${JSON.stringify(state)}`);
        // @ts-ignore
        this.emitter.emit(`${String(key)}StateChange`, state, oldState)
    }

    //                                                     TARGET

    /**
     * getter for current target of the module
     * @returns readonly target
     */
    public getTarget(): Readonly<Partial<C>> { return this.target }

    /**
     * sets target values of the module
     */
    public setTarget(target: Partial<C>) {
        this.validateConfig(target)
        for (const key in target) {
            const oldTarget = this.target[key]
            this.target[key] = target[key]
            // this.logger.log(`Target of ${key.toString()} changed to ${JSON.stringify(target[key])}`);
            // @ts-ignore
            this.emitter.emit(`${String(key)}TargetChange`, target[key], oldTarget)
        }
    }
    protected abstract validateConfig(target: Partial<C>): void;


    //                                                     STATE & TARGET

    /**
     * checks if the target is different from the state
     * returns:
     * | force | target undefined | state undefined | target === state | target !== state |
     * |-------|------------------|-----------------|------------------|------------------|
     * | false | false            | true            | false            | true             |
     * | true  | false            | true            | true             | true             | 
     * 
     * @param key the key to check, if undefined all keys are checked
     * @param force if true, returns false only if target is undefined
     */
    public isDirty<K extends keyof C>(key?: K, force = false): boolean {
        if (key === undefined) {
            for (const key in this.target)
                if (this.types[key] !== "INTERNAL" && this.isDirty(key, force))
                    return true
            return false
        }
        if (this.target[key] === undefined)
            return false
        if (this.state[key] === undefined) return true
        if (force) return true
        if (typeof this.target[key] === "object") {
            //deep compare
            for (const k in this.target[key]) {
                if (this.target[key][k] !== this.state[key][k]) return true
            }
            return false
        } else {
            return this.target[key] !== this.state[key]
        }
    }
    protected getIfDirty<K extends keyof C>(key: K, force: boolean): C[K] | undefined {
        if (this.isDirty(key, force)) return this.target[key]
    }

    /**
     * generates a config specific to the module
     */
    public abstract configGenerate(): Readonly<C>;

    // GameState
    protected gameState: GameState = "test_idle"
    private playDisposables: (() => void)[] = []
    protected addPlayDisposable(disposable: () => void) { this.playDisposables.push(disposable) }

    protected abstract setPlayState(): void
    public setGameState(state: GameState): void {
        if (this.gameState === state) {
            if (state != "test_idle")
                this.logger.warn(`GameState already ${state}`)
            return
        }
        this.gameState = state
        this.logger.info(`Game State changed to ${state}`)
        if (state === "playing") {
            //TODO assert target is valid
            this.setPlayState()
        } else {
            this.playDisposables.forEach(d => d())
            this.playDisposables = []
        }
        if (state == "setup") {
            const config = this.configGenerate()
            this.logger.log("Generated config:", config)
            this.setTarget(config)
        }
        if (state == "test_idle") {
            //TODO delete target
        }
    }

    // SPI
    /**
     * updates all "WRITE" values to the module
     */
    protected abstract update(force?: boolean): void;

    protected abstract moduleReceivedMessage(msg: ModuleMessageType): boolean;

    public receivedMessage(msg: ModuleMessageType) {
        switch (msg.cmd) {

            case ModuleCommands.moduleSpiMosiErrorCountGet:
            case ModuleCommands.moduleSpiMisoErrorCountGet:
                //TODO combine both events and then raise Event
                break

            case ModuleCommands.moduleErrorGet:
                if (msg.data.length !== 2)
                    throw new SpiError(SpiErrorType.InvalidDataLength, "moduleErrorGet")
                {
                    const errorCode = msg.data[1]
                    throw new SpiError(errorCode)
                }

            default:
                if (!this.moduleReceivedMessage(msg)) {
                    throw new SpiError(SpiErrorType.InvalidCommandFromModule, SpiMessageToString(msg))
                }
                break
        }
    }
}
