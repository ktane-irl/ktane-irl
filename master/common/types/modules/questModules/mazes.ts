import { QuestConfiguration } from "./quest"

// 6x6 MAZE
export type CoordinateType = {
    x: number
    y: number
}

// BUTTON STATES
export enum MazeButtonPositionNames {
    top = "top",
    right = "right",
    bottom = "bottom",
    left = "left",
}
export type MazeButtonStateType = Record<MazeButtonPositionNames, boolean>

// WALL MATRIX
export type WallMatrixType = boolean[][] // boolean[y][x]

// SPECIAL POSITIONS
export enum MazeSpecialPositions {
    circle1 = 0,
    circle2 = 1,
    player = 2,
    target = 3,
}
export type MazeSpecialPositionNames = keyof typeof MazeSpecialPositions

export type MazeSpecialStateType = Record<MazeSpecialPositionNames, CoordinateType> | null

// CONFIGURATION
export type MazesConfiguration = {
    button: MazeButtonStateType
    wallMatrix: WallMatrixType
    special: MazeSpecialStateType
} & QuestConfiguration

export function coordinateToIndex(coordinate: CoordinateType | null): number {
    if (coordinate === null)
        return 0x3F
    if (coordinate.x < 0 || coordinate.x > 5 || coordinate.y < 0 || coordinate.y > 5)
        throw new Error("Coordinate out of bounds")
    return coordinate.y * 6 + coordinate.x
}

export function indexToCoordinate(index: number): CoordinateType {
    if (index < 0 || index > 35)
        throw new Error("Index out of bounds")
    return {
        x: index % 6,
        y: Math.floor(index / 6),
    }
}
