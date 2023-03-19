import { ModuleMessageType } from "../../../types/spi"
import { SpiError, SpiErrorType } from "../../../spiError"
import { Mazes, MazesConfigType } from "./mazes"
import { MazeButtonStateType, MazeSpecialPositions, MazeSpecialStateType, WallMatrixType, coordinateToIndex } from "../../../../../common/types/modules/questModules/mazes"

export enum Ma01Commands {
    buttonsGet = 0x02,
    wallPositionsSet = 0x03,
    specialPositionsSet = 0x04,
}


function wallPositionsToBytes(wallPositions: WallMatrixType): number[] { //TODO FIX
    const bytes: number[] = []
    const wallArray = wallPositions.reduce((acc, val) => acc.concat(val), [])

    for (let i = 0; i < wallArray.length / 8; i++) {
        let byte = 0
        for (let j = 0; j < 8; j++) {
            if (i * 8 + j >= wallArray.length) break
            byte |= (wallArray[i * 8 + j] ? 1 : 0) << (7 - j)
        }
        bytes.push(byte)
    }

    return bytes
}

function specialPositionsToBytes(specialPositions: MazeSpecialStateType): number[] {
    const bytes: number[] = []

    if (!specialPositions) {
        bytes.push(MazeSpecialPositions.circle1 << 6 | coordinateToIndex(null))
        bytes.push(MazeSpecialPositions.circle2 << 6 | coordinateToIndex(null))
        bytes.push(MazeSpecialPositions.player << 6 | coordinateToIndex(null))
        bytes.push(MazeSpecialPositions.target << 6 | coordinateToIndex(null))
    } else {
        bytes.push(MazeSpecialPositions.circle1 << 6 | coordinateToIndex(specialPositions["circle1"]))
        bytes.push(MazeSpecialPositions.circle2 << 6 | coordinateToIndex(specialPositions["circle2"]))
        bytes.push(MazeSpecialPositions.player << 6 | coordinateToIndex(specialPositions["player"]))
        bytes.push(MazeSpecialPositions.target << 6 | coordinateToIndex(specialPositions["target"]))
    }

    return bytes
}

export class Ma01 extends Mazes {

    readonly types: MazesConfigType = {
        statusLed: "WRITE",
        button: "READ",
        wallMatrix: "WRITE",
        special: "WRITE",
    }

    constructor(pos: number) {
        super(1, pos)
        this.emitter.on("statusLedTargetChange", () => this.updateStatusLed(false))
        this.emitter.on("wallMatrixTargetChange", () => this.updateWallPositions(false))
        this.emitter.on("specialTargetChange", () => this.updateSpecialPositions(false))
    }

    // SPI
    protected update(force = false) {
        this.updateStatusLed(force)
        this.updateWallPositions(force)
        this.updateSpecialPositions(force)
    }

    updateWallPositions(force: boolean) {
        const target = this.getIfDirty("wallMatrix", force)
        if (target === undefined) return

        // send to spi
        this.sendMessage({
            cmd: Ma01Commands.wallPositionsSet,
            data: wallPositionsToBytes(target)
        })
        // update state
        this.setState("wallMatrix", target)
    }

    updateSpecialPositions(force: boolean) {
        const target = this.getIfDirty("special", force)
        if (target === undefined) return

        // send to spi
        this.sendMessage({
            cmd: Ma01Commands.specialPositionsSet,
            data: specialPositionsToBytes(target) //TODO only send changed
        })

        // update state
        this.setState("special", target)
    }

    moduleReceivedMessage(msg: ModuleMessageType): boolean {
        switch (msg.cmd) {
            case Ma01Commands.buttonsGet:
                {
                    msg.data.shift()//! remove the first byte
                    if (msg.data.length !== 1)
                        throw new SpiError(SpiErrorType.InvalidDataLengthFromModule, `Wi01.colorsGet ${msg.data.length} != 1`)
                    const data = msg.data[0] & 0b1111
                    const buttons: MazeButtonStateType = {
                        top: (data & 0b1000) != 0,
                        right: (data & 0b0100) != 0,
                        bottom: (data & 0b0010) != 0,
                        left: (data & 0b0001) != 0,
                    }
                    this.setState("button", buttons)
                }
                return true
            default:
                return false
        }
    }
}
