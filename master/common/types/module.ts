
export type Configuration = { [key: string]: any };

export type ConfigType = "INTERNAL" | "UNKNOWN" | "READ" | "WRITE";
export type ConfigTypes<T> = Record<keyof T, ConfigType>;

export { SpiModulePosition } from "./spi";

export enum ModuleType {
    NoModule = -1,
    Case = 0,
    ClockModule = 1,
    Wires = 2,
    TheButton = 3,
    Keypads = 4,
    SimonSays = 5,
    WhosOnFirst = 6,
    Memory = 7,
    MorseCode = 8,
    ComplicatedWires = 9,
    WireSequences = 10,
    Mazes = 11,
    Passwords = 12,
    VentingGas = 16,
    CapacitorDischarge = 17,
    Knobs = 18,
}
export type ModuleValidType = Exclude<ModuleType, ModuleType.NoModule>;

export function isModuleValidType(type: ModuleType): type is ModuleValidType {
    return type !== ModuleType.NoModule;
}

export function moduleTypeToString(type?: ModuleType, version?: number): string {
    if (version !== undefined) {
        return `${ModuleType[type === undefined ? -1 : type]} v${version}`;
    } else {
        return `${ModuleType[type === undefined ? -1 : type]}`;
    }
}