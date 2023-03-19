import { ModuleType } from "../../../../../common/types/module"
import { Emitter } from "../../../events"
import { QuestModule, QuestModuleConfigType, QuestModuleEvents } from "../questModule"
import { CoordinateType, MazeButtonPositionNames, MazesConfiguration } from "../../../../../common/types/modules/questModules/mazes"
import { QuestConfiguration } from "../../../../../common/types/modules/questModules/quest"
import { iterateEnum, notUndefined } from "../../../helper"
import { ConfigurationError, ConfigurationErrorType } from "../../configurationError"

// EVENTS
export type MazesEvents = QuestModuleEvents<MazesConfiguration>

export type MazesConfigType = QuestModuleConfigType & {
    button: "READ"
    wallMatrix: "WRITE"
    special: "WRITE"
}

export abstract class Mazes extends QuestModule<MazesConfiguration> {

    public readonly emitter: Emitter<MazesEvents> = new Emitter

    abstract readonly types: MazesConfigType

    constructor(
        version: number,
        pos: number,
    ) {
        super(ModuleType.Mazes, version, pos)
    }

    // STATE - TARGET

    protected validateConfig(config: Partial<MazesConfiguration>): void {
        if (notUndefined(config.wallMatrix)) {
            if (config.wallMatrix.length !== 6)
                throw new ConfigurationError(ConfigurationErrorType.ArrayLengthMismatch, "wallMatrix rows")
            for (const row of config.wallMatrix) {
                if (row.length !== 6)
                    throw new ConfigurationError(ConfigurationErrorType.ArrayLengthMismatch, "wallMatrix columns")
            }
        }
        if (notUndefined(config.special)) {
            if (config.special) {
                for (const [key, coordinate] of Object.entries(config.special)) {
                    if (notUndefined(coordinate) && (coordinate.x < 0 || coordinate.x > 5 || coordinate.y < 0 || coordinate.y > 5))
                        throw new ConfigurationError(ConfigurationErrorType.ConfigNotPossible, key)
                }
            }
        }
    }

    public configGenerate(): MazesConfiguration & QuestConfiguration {
        const maze = Math.floor(Math.random() * CircleConfigurations.length)

        const player = { x: Math.floor(Math.random() * 6), y: Math.floor(Math.random() * 6) }
        let target
        do {
            target = { x: Math.floor(Math.random() * 6), y: Math.floor(Math.random() * 6) }
        } while (player.x === target.x && player.y === target.y)

        return {
            statusLed: { red: false, green: false },
            button: {
                top: false,
                right: false,
                bottom: false,
                left: false,
            },
            wallMatrix: [
                [false, false, false, false, false, false],
                [false, false, false, false, false, false],
                [false, false, false, false, false, false],
                [false, false, false, false, false, false],
                [false, false, false, false, false, false],
                [false, false, false, false, false, false],
            ],
            special: {
                circle1: CircleConfigurations[maze][0],
                circle2: CircleConfigurations[maze][1],
                player,
                target,
            }
        }
    }

    protected setPlayState(): void {
        // button press event
        this.addPlayDisposable(this.emitter.on("buttonStateChange", (now, old) => {

            // check if already solved
            if (this.isSolved()) return

            this.logger.log("processing button press", now, old)
            if (!old) throw new Error("old button state not defined")

            // check if button is pressed
            const pressed = iterateEnum(MazeButtonPositionNames).find(name => now[name] && !old[name])
            if (!pressed) return

            // check if button is pressed in the right direction
            const { player, circle1, circle2, target } = this.getState().special!
            const move = processMovement(player, circle1, circle2, pressed)

            if (move.valid) {
                this.setTarget({ special: { player: { x: move.x, y: move.y }, circle1, circle2, target } })
                if (move.x === target.x && move.y === target.y) {
                    this.handleSolved()
                }
            } else {
                this.handleFailed()
                if (move.valid === false) { // show red led
                    this.setTarget({ wallMatrix: changeValueInMatrix(this.getState().wallMatrix!, move.x, move.y, true) })
                    const timeout = setTimeout(() => {
                        this.setTarget({ wallMatrix: changeValueInMatrix(this.getState().wallMatrix!, move.x, move.y, false) })
                    }, 1000)
                    this.addPlayDisposable(() => { clearTimeout(timeout) })
                }
            }
        }).off)
    }
}

const CircleConfigurations: [CoordinateType, CoordinateType][] = [
    [{ x: 0, y: 1 }, { x: 5, y: 2 }],
    [{ x: 1, y: 3 }, { x: 4, y: 1 }],
    [{ x: 3, y: 3 }, { x: 5, y: 3 }],

    [{ x: 0, y: 0 }, { x: 0, y: 3 }],
    [{ x: 3, y: 5 }, { x: 4, y: 2 }],
    [{ x: 2, y: 4 }, { x: 4, y: 0 }],

    [{ x: 1, y: 0 }, { x: 1, y: 5 }],
    [{ x: 3, y: 0 }, { x: 2, y: 3 }],
    [{ x: 0, y: 4 }, { x: 2, y: 1 }],
]

function changeValueInMatrix(matrix: boolean[][], nx: number, ny: number, value: boolean) {
    return matrix.map((row, y) => row.map((cell, x) => x === nx && y === ny ? value : cell))
}

/**
 * Calculates the next position of the player
 * @param pos player position
 * @param circle1 first circle position
 * @param circle2 second circle position
 * @param direction direction of the button press
 * @returns new position or false if the move is not possible
 */
function processMovement(pos: CoordinateType, circle1: CoordinateType, circle2: CoordinateType, direction: MazeButtonPositionNames):
    CoordinateType & { valid: true } | CoordinateType & { valid: false } | { valid: null } {
    const maze = CircleConfigurations.findIndex(([c1, c2]) => c1.x === circle1.x && c1.y === circle1.y && c2.x === circle2.x && c2.y === circle2.y)
    const directions = MazeConfiguration[maze][pos.y][pos.x]

    const directionValue = {
        [MazeButtonPositionNames.top]: 1,
        [MazeButtonPositionNames.right]: 2,
        [MazeButtonPositionNames.bottom]: 4,
        [MazeButtonPositionNames.left]: 8,
    }[direction]

    const ret: CoordinateType = { x: pos.x, y: pos.y }
    switch (direction) {
        case MazeButtonPositionNames.top: ret.y--; break
        case MazeButtonPositionNames.right: ret.x++; break
        case MazeButtonPositionNames.bottom: ret.y++; break
        case MazeButtonPositionNames.left: ret.x--; break
    }
    if (directions & directionValue) {
        return { ...ret, valid: true }
    } else if (ret.x >= 0 && ret.x < 6 && ret.y >= 0 && ret.y < 6) {
        return { ...ret, valid: false }
    } else {
        return { valid: null }
    }
}

//  1
//8   2
//  4

const MazeConfiguration: number[][][] = [ // [maze][y][x]: movable direction: 1=top, 2=right, 4=bottom, 8=left
    [
        [6, 10, 12, 6, 10, 8],
        [5, 6, 9, 3, 10, 12],
        [5, 3, 12, 6, 10, 13],
        [5, 2, 11, 9, 2, 13],
        [7, 10, 12, 6, 8, 5],
        [3, 8, 3, 9, 2, 9],
    ], [
        [2, 14, 8, 6, 14, 8],
        [6, 9, 6, 9, 3, 12],
        [5, 6, 9, 6, 10, 13],
        [7, 9, 6, 9, 4, 5],
        [5, 4, 5, 6, 9, 5],
        [1, 3, 9, 3, 10, 9],
    ], [
        [6, 10, 12, 4, 6, 12],
        [1, 4, 5, 3, 9, 5],
        [6, 13, 5, 6, 12, 5],
        [5, 5, 5, 5, 5, 5],
        [5, 3, 9, 5, 5, 5],
        [3, 10, 10, 9, 3, 9],
    ], [
        [6, 12, 2, 10, 10, 12],
        [5, 5, 6, 10, 10, 13],
        [5, 3, 9, 6, 8, 5],
        [5, 2, 10, 11, 10, 13],
        [7, 10, 10, 10, 12, 5],
        [3, 10, 8, 2, 9, 1],
    ], [
        [2, 10, 10, 10, 14, 12],
        [6, 10, 10, 14, 9, 1],
        [7, 12, 2, 9, 6, 12],
        [5, 3, 10, 12, 1, 5],
        [5, 6, 10, 11, 8, 5],
        [1, 3, 10, 10, 10, 9],
    ], [
        [4, 6, 12, 2, 14, 12],
        [5, 5, 5, 6, 9, 5],
        [7, 9, 1, 5, 6, 9],
        [3, 12, 6, 13, 5, 4],
        [6, 9, 1, 5, 3, 13],
        [3, 10, 10, 9, 2, 9],
    ], [
        [6, 10, 10, 12, 6, 12],
        [5, 6, 8, 3, 9, 5],
        [3, 9, 6, 8, 6, 9],
        [6, 12, 7, 10, 9, 4],
        [5, 1, 3, 10, 12, 5],
        [3, 10, 10, 10, 11, 9],
    ], [
        [4, 6, 10, 12, 6, 12],
        [7, 11, 8, 3, 9, 5],
        [5, 6, 10, 10, 12, 5],
        [5, 3, 12, 2, 11, 9],
        [5, 4, 3, 10, 10, 8],
        [3, 11, 10, 10, 10, 8],
    ], [
        [4, 6, 10, 10, 14, 12],
        [5, 5, 6, 8, 5, 5],
        [7, 11, 9, 6, 9, 5],
        [5, 4, 6, 9, 2, 13],
        [5, 5, 5, 6, 12, 1],
        [3, 9, 3, 9, 3, 8],
    ]
]


// debug print mazes
// for (const i in MazeConfiguration) {
//     console.log("maze " + i)
//     for (let y = 0; y < 6; y++) {
//         let line = ["", "", ""]
//         for (let x = 0; x < 6; x++) {
//             const directions = MazeConfiguration[i][y][x]
//             line[0] += directions & 1 ? "# #" : "###"
//             line[2] += directions & 4 ? "# #" : "###"
//             line[1] += directions & 8 ? " " : "#"
//             const isCircle = CircleConfigurations[i].some(c => c.x === x && c.y === y)
//             line[1] += isCircle ? "o" : " "
//             line[1] += directions & 2 ? " " : "#"
//         }
//         console.log(line[0])
//         console.log(line[1])
//         console.log(line[2])
//     }
// }
