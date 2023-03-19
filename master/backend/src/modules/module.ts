import { Emitter } from "../events"
import { Configuration, ModuleType, moduleTypeToString, SpiModulePosition } from "../../../common/types/module"
import { ModuleMessageType, SpiMessageType } from "../types/spi"
import { Case } from "./00-case/case"
import { ClockModule } from "./01-clock/clock"
import { GameState } from "../types/game"
import { Quest } from "./moduleTypes"

export type ModuleEvents = {
    // "initDone": () => void,
    // "error": (error: SpiErrorType) => void,
}

type CallbacksType = {
    sendMessage: (msg: SpiMessageType) => void
    getCase: () => Case
    getClock: () => ClockModule
}

export enum ModuleCommands {
    moduleSpiMosiErrorCountGet = 0xEB,
    moduleSpiMisoErrorCountGet = 0xEC,
    moduleResendEvents = 0xFD,
    moduleResetReq = 0xFE,
    moduleErrorGet = 0xFE,
}

export abstract class Module {
    public abstract readonly emitter: Emitter<ModuleEvents>;

    public abstract readonly type: ModuleType;
    public abstract readonly version: number;
    public abstract readonly pos: SpiModulePosition;

    public get name() { return moduleTypeToString(this.type, this.version) + " at " + this.pos }

    public abstract destroy(): void;

    public abstract getState(): Configuration;
    public abstract getTarget(): Configuration;
    public abstract setTarget(target: Configuration): void;
    public abstract configGenerate(): Readonly<Configuration>;
    public abstract isDirty(key: keyof Configuration): boolean;
    public abstract isDirty(): boolean;

    // SPI
    public abstract receivedMessage(msg: ModuleMessageType): void;
    protected sendMessage(msg: ModuleMessageType) {
        if (!this.callbacks) throw new Error("sendMessage called before setSendMessageCallback")
        this.callbacks.sendMessage({ ...msg, pos: this.pos })
    }
    protected abstract update(force?: boolean): void;

    public forceUpdate(resendModuleReadValues = true) {
        if (resendModuleReadValues) this.sendMessage({ cmd: ModuleCommands.moduleResendEvents, data: [this.type] })
        this.update(true)
    }

    public error_counter = 0

    // GameState
    public abstract setGameState(state: GameState): void;

    // IS TYPE
    public isCase(): this is Case { return this.type === ModuleType.Case }
    public isClock(): this is ClockModule { return this.type === ModuleType.ClockModule }

    public isQuest(): this is Quest { return "isSolved" in this }

    // GET TYPE
    public getCase(): Case {
        if (!this.callbacks) throw new Error("getCase called before setSendMessageCallback")
        return this.callbacks.getCase()
    }
    public getClock(): ClockModule {
        if (!this.callbacks) throw new Error("getClock called before setSendMessageCallback")
        return this.callbacks.getClock()
    }

    // CALLBACKS
    private callbacks: CallbacksType | undefined
    public setCallbacks(callbacks: CallbacksType) {
        this.callbacks = callbacks
    }
}

export function isCase(m: Module | null): m is Case { return m?.isCase() || false }
export function isClock(m: Module | null): m is ClockModule { return m?.isClock() || false }
