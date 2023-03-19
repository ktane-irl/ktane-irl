import { isModuleValidType, ModuleType } from "../../../common/types/module"
import { combineIdVersion } from "../helper"
import { SpiError, SpiErrorType } from "../spiError"
import { Module } from "./module"
import { Ca01 } from "./00-case/ca01"
import { Cm01 } from "./01-clock/cm01"
import { Wi01 } from "./questModules/02-wires/wi01"
import { Ss01 } from "./questModules/05-simonSays/ss01"
import { Ma01 } from "./questModules/11-mazes/ma01"
//* template: import { Te01 } from "./questModules/templates/te01"

export function createModule(type: ModuleType, version: number, pos: number): Module {
    if (!isModuleValidType(type))
        throw new SpiError(SpiErrorType.ModuleTypeNotSupported, `invalid module type: ${type}`)

    switch (combineIdVersion(type, version)) {
        case combineIdVersion(ModuleType.Case, 1): return new Ca01(pos)
        case combineIdVersion(ModuleType.ClockModule, 1): return new Cm01(pos)
        case combineIdVersion(ModuleType.Wires, 1): return new Wi01(pos)
        case combineIdVersion(ModuleType.SimonSays, 1): return new Ss01(pos)
        case combineIdVersion(ModuleType.Mazes, 1): return new Ma01(pos)
        //* template: case combineIdVersion(ModuleType.NoModule, 1): return new Te01(pos)
    }
    throw new SpiError(SpiErrorType.ModuleTypeNotSupported, `Module type ${ModuleType[type]} (${type}) with version ${version} is not supported`)
}
