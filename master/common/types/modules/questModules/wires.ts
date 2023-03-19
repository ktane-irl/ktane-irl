import { QuestConfiguration } from "./quest"

// WIRES
export const wireCount = 6

// WIRE CONNECTIONS
export type wireConnectedType = boolean[]

// WIRE COLORS
export enum wireColor {
    not_connected = 0,
    black = 1,
    blue = 2,
    red = 4,
    yellow = 5,
    white = 6,
}

export type wireColorType = wireColor[]

// CONFIGURATION
export type WiresConfiguration = {
    // wiresConnected: wireConnectedType,
    wiresColor: wireColorType,
} & QuestConfiguration
// export type WiresConfigTypes = ConfigTypes<WiresConfiguration>
