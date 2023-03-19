import { ModuleType, ModuleValidType } from "../../common/types/module"

export function createArray<T>(length: number, value: T): T[] {
    return Array(length).fill(value)
}

export function compArray<T>(a: T[], b: T[]): boolean {
    return a.every((v, i) => v === b[i])
}

export function compArrayIgnoreUndefined<T>(a: (T | undefined)[], b: (T | undefined)[]): boolean {
    return a.every((v, i) => v === undefined || v === b[i] || b[i] === undefined)
}

export function boolArrayToByte(arr: boolean[]): number {
    let value = 0
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
            value |= 1 << i
        }
    }
    return value
}

export function byteToBoolArray(value: number, length: number): boolean[] {
    const arr = createArray(length, false)
    for (let i = 0; i < length; i++) {
        arr[i] = (value & (1 << i)) !== 0
    }
    return arr
}

export function noUndefinedInArray<T>(arr: (T | undefined)[]): arr is T[] {
    return arr.every(v => v !== undefined)
}

export function notUndefined<T>(v: T | undefined): v is T {
    return v !== undefined
}

export function combineIdVersion(id: ModuleValidType, version: number): number {
    return id + (version << 8)
}

export function isTestMode(): boolean {
    return process.env.JEST_WORKER_ID !== undefined
}

/**
 * Creates an Array and fills it with the defaultValue
 * @param length length of output array
 * @param defaultValue default value for all elements
 * @returns array with default values
 */
export function fillArray<T>(length: number, defaultValue: T): T[] {
    return Array.from({ length }, () => defaultValue)
}

/**
 * Creates an Array and fills it with random values
 * @param length length of output array
 * @param randomValues values to be placed into the array
 * @returns array with random values
 */
export function fillRandomArray<T>(length: number, randomValues: T[]): T[] {
    return Array.from({ length }, () => randomValues[Math.floor(Math.random() * randomValues.length)])
}

/**
 * Creates an Array and fills the special values in random positions
 * @param length length of output array
 * @param defaultValue default value for all elements
 * @param specialValues values to be placed in random positions
 * @returns array with special values in random positions
 */
export function fillSpecialArray<T>(length: number, defaultValue: T, specialValues: T[]): T[] {
    if (specialValues.length > length) throw new Error("specialValues.length > length")
    const arr = fillArray(length, defaultValue)
    for (const e of specialValues) {
        if (e === defaultValue) throw new Error("specialValues contains defaultValue")
        let randomIndex: number
        do {
            randomIndex = Math.floor(Math.random() * length)
        } while (arr[randomIndex] !== defaultValue)
        arr[randomIndex] = e
    }
    return arr
}


/**
 * use this function to iterate over an enum
 * for (const key of iterateEnum(MyEnum)) { ... }
 * @param e enum
 * @returns iterator array
 */
export function iterateEnum<T extends object>(e: T): T[keyof T][] {
    return Object.values(e) as T[keyof T][]
}


// API
export function checkModuleType(targetModuleType: string, stateModuleTypeValue: ModuleType): boolean {
    const stateModuleTypeKey = ModuleType[stateModuleTypeValue]
    const targetModuleTypeUpperCase = targetModuleType.charAt(0).toUpperCase() + targetModuleType.slice(1)

    if (stateModuleTypeKey === targetModuleTypeUpperCase) {
        return true
    } else {
        return false
    }
}
