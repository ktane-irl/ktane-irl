/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ModuleType } from "../../../../common/types/module"
import { SpecificModule } from "../specificModule"
import { QuestConfiguration } from "../../../../common/types/modules/questModules/quest"
import { Emitter } from "../../events"
import { Quest, SpecificModuleEvents } from "../moduleTypes"

export enum QuestCommands {
    ledGet = 0x01,
}

export type QuestModuleEvents<C extends QuestConfiguration> = {
    solved: () => void;
} & SpecificModuleEvents<C>

export type QuestModuleConfigType = {
    statusLed: "WRITE"
}

export abstract class QuestModule<C extends QuestConfiguration> extends SpecificModule<C> implements Quest {

    public abstract readonly emitter: Emitter<QuestModuleEvents<C>>

    constructor(type: ModuleType, version: number, pos: number) {
        super(type, version, pos)
    }

    public destroy(): void {
        super.destroy()
        if (this.handleTimeout) {
            clearTimeout(this.handleTimeout)
            this.handleTimeout = undefined
        }
    }


    updateStatusLed(force: boolean) {
        const target = this.getIfDirty("statusLed", force)
        if (target === undefined) return

        this.logger.log("updateStatusLed", target)
        // send to spi
        this.sendMessage({ cmd: QuestCommands.ledGet, data: [(Number(target.red) << 1) | Number(target.green)] })
        // update state
        this.setState("statusLed", target)
    }

    // PLAY

    private solved = false

    public isSolved() { return this.solved }

    private handleTimeout: NodeJS.Timeout | undefined
    protected handleFailed() {
        if (this.solved) return
        this.logger.log("questModule handleFailed")
        if (this.handleTimeout) clearTimeout(this.handleTimeout)
        // @ts-ignore
        this.setTarget({ statusLed: { red: true, green: false } })
        this.handleTimeout = setTimeout(() => {
            // @ts-ignore
            this.setTarget({ statusLed: { red: false, green: false } })
        }, 1000)
        this.getClock().addStrike()
    }

    protected handleSolved() {
        if (this.solved) return
        this.logger.log("questModule handleSolved")
        if (this.handleTimeout) {
            clearTimeout(this.handleTimeout)
            this.handleTimeout = undefined
        }
        // @ts-ignore
        this.setTarget({ statusLed: { red: false, green: true } })
        this.solved = true
        this.addPlayDisposable(() => this.solved = false)
        // @ts-ignore
        this.emitter.emit("solved")
    }
}
