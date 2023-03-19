import { Configuration } from "../../../common/types/module"
import { QuestConfiguration } from "../../../common/types/modules/questModules/quest"
import { Emitter } from "../events"
import { ModuleEvents } from "./module"

export type TargetChangeEvents<C extends Configuration> = {
    [Property in keyof C as `${string & Property}TargetChange`]: (newTarget: C[Property], oldTarget: Partial<C>[Property]) => void
};

export type StateChangeEvents<C extends Configuration> = {
    [Property in keyof C as `${string & Property}StateChange`]: (newState: C[Property], oldState: Partial<C>[Property]) => void
};

export type SpecificModuleEvents<T extends Configuration> = ModuleEvents & StateChangeEvents<T> & TargetChangeEvents<T>;



export interface Quest {
    isSolved(): boolean;
    emitter: Emitter<QuestModuleEvents<QuestConfiguration>>
}



export type QuestModuleEvents<C extends QuestConfiguration> = {
    solved: () => void;
} & SpecificModuleEvents<C>


