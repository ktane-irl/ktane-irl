import { QuestConfiguration } from "./quest"

// LED STATES
export enum SimonSaysColor {
    red = "red",
    green = "green",
    yellow = "yellow",
    blue = "blue",
}

export type ButtonStateType = Record<SimonSaysColor, boolean>

export type LedType = Record<SimonSaysColor, boolean>

// CONFIGURATION
export type SimonSaysConfiguration = {
    led: LedType
    button: ButtonStateType
    sequence: SimonSaysColor[]
    sequenceLength: number
} & QuestConfiguration
