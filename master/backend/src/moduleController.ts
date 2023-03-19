import { isCase, isClock, Module } from "./modules/module"
import { Emitter } from "./events"
import { createArray, fillArray } from "./helper"
import { SpiModulePosition } from "../../common/types/spi"
import { ModuleType, moduleTypeToString } from "../../common/types/module"
import { createModule } from "./modules/moduleCreator"
import { SpiMessageType } from "./types/spi"
import { SpiError, SpiErrorType } from "./spiError"
import { ConsoleLogger } from "./logger"
import { getGameState, onGameStateChange, setGameState } from "./gamemaster"
import { Case } from "./modules/00-case/case"
import { ClockModule } from "./modules/01-clock/clock"
import { playSound, Sounds } from "./audioController"

const logger = new ConsoleLogger("module controller")

/**
 * connect send/receive functions
 * @param sendMessageCallback called function when a message should be sent
 * @returns a function to call when a message is received
 */
export default function connectTo(sendCallback: (msg: SpiMessageType) => void): (msg: SpiMessageType) => void {
    if (sendMessageCallback) throw new Error("sendCallback already set")
    sendMessageCallback = sendCallback
    return spiReceivedMessage
}

let sendMessageCallback: ((msg: SpiMessageType) => void) | undefined

function sendMessage(msg: SpiMessageType) {
    if (!sendMessageCallback) throw new Error("sendCallback not set")
    sendMessageCallback(msg)
}

const modules: Array<Module | null> = createArray(13, null)

export const moduleEmitter = new Emitter<{
    moduleAdded: (module: Module, pos: SpiModulePosition) => void,
    moduleRemoved: (module: Module, pos: SpiModulePosition) => void,
}>()

/**
 * @returns readonly module array
 */
export function getModules(): ReadonlyArray<Module | null> {
    return modules
}

/**
 * Returns the module at the given position or null if no module is present
 * @param position position of the module
 * @returns module or null
 */
export function moduleAt(position: SpiModulePosition): Module | null {
    return modules[position]
}

/** 
 * Returns the Case module, throws an error if no case is present
 */
export function getCase(): Case {
    const c = modules.find(isCase)
    if (!c) throw Error("Case not found")
    return c
}

/**
 * Returns the Clock module, throws an error if no clock is present
 */
export function getClock(): ClockModule {
    const c = modules.find(isClock)
    if (!c) throw Error("Clock not found")
    return c
}

enum Commands {
    errorCode = 0xFE,
    moduleInitialize = 0xFD,
    moduleReset = 0xFC,
}

enum ControllerCommands {
    modulesConnected = 0x01,
    error = 0xFE,
}


function createModuleAt(type: ModuleType, version: number, position: SpiModulePosition): Module {
    // what if module already exists?
    if (modules[position]) throw new Error("module already exists, can not create new one")

    logger.log(`creating module ${moduleTypeToString(type, version)} at pos ${position}`)

    const module = createModule(type, version, position)
    module.setCallbacks({ sendMessage, getCase, getClock })
    modules[position] = module
    module.setGameState(getGameState())

    moduleEmitter.emit("moduleAdded", module, position)
    return module
}

function removeModuleAt(position: SpiModulePosition, force = false): void {
    const module = modules[position]
    if (!module) {
        if (!force) return
        throw new SpiError(SpiErrorType.ModuleNotInitialized)
    }
    logger.log(`removing module ${moduleTypeToString(module.type, module.version)} at pos ${position}`)
    module.destroy()
    modules[position] = null
    moduleEmitter.emit("moduleRemoved", module, position)
}

/**
 * handlees changed GameState
 */
let playDisposable: (() => void)[] = []
onGameStateChange((state) => {
    // change game state of all modules
    for (const module of modules) {
        if (module) module.setGameState(state)
    }

    // handle play state
    if (state === "playing") {
        playSound(Sounds.GAME_START)
        for (const module of modules) {
            if (module && module.isQuest()) playDisposable.push(module.emitter.on("solved", () => {
                // check if all quests are solved
                if (modules.every(m => !m || !m.isQuest() || m.isSolved())) {
                    // all quests are solved
                    logger.info("BOMB SOLVED")
                    playSound(Sounds.GAME_SOLVED)
                    setGameState("test_idle")
                }
            }).off)

            if (module && module.isClock()) playDisposable.push(
                module.emitter.on("timeElapsed", () => {
                    logger.info("TIME IS UP")
                    playSound(Sounds.GAME_FAILED)
                    setGameState("test_idle")
                }).off,
                module.emitter.on("strikesChanged", (strikes) => {
                    if (strikes >= 3) {//TODO get max strikes
                        logger.info("BOMB EXPLODED")
                        playSound(Sounds.GAME_FAILED)
                        setGameState("test_idle")
                    } else {
                        playSound(Sounds.GAME_STRIKE)
                    }
                }).off
            )
        }
    } else {
        playDisposable.forEach(d => d())
        playDisposable = []
    }
})


/**
 * handles a received spi message from socket
 */
function spiReceivedMessage(msg: SpiMessageType) {
    if (msg.pos == 255) {
        try {
            switch (msg.cmd) {
                case ControllerCommands.modulesConnected:
                    {
                        if (msg.data.length !== 2)
                            throw new SpiError(SpiErrorType.InvalidDataLength)
                        const modulesConnected: boolean[] = []
                        for (let i = 0; i < 13; i++) {
                            modulesConnected[i] = (msg.data[i < 8 ? 1 : 0] & (1 << (i % 8))) !== 0
                        }
                        logger.log("modules connected: " + (modulesConnected.map((v, i) => v ? i : "").filter(v => v !== "").join(", ") || "none"))

                        for (let i = 0; i < 13; i++) { //TODO check gameMode
                            if (modulesConnected[i]) {
                                if (!modules[i]) {
                                    logger.info(`unknown module at pos ${i}`)
                                    requestModuleReset(i)
                                }
                            } else {
                                if (modules[i]) {
                                    if (getGameState() === "playing") {
                                        throw new SpiError(SpiErrorType.ModuleRemovedInGame, `Module ${moduleTypeToString(modules[i]?.type, modules[i]?.version)} at pos ${i}`)
                                    } else {
                                        removeModuleAt(i)
                                    }
                                }
                            }
                        }
                    }

                    break

                case ControllerCommands.error:
                    {
                        if (msg.data.length !== 2)
                            throw new SpiError(SpiErrorType.InvalidDataLength)

                        const errorPos = msg.data[0]
                        const errorCode = msg.data[1]
                        if (errorPos !== 255 && errorPos > 12) {
                            throw new SpiError(SpiErrorType.InvalidPositionFromController)
                        }

                        if (errorPos === 255) {
                            spiControllerErrorHandling(new SpiError(errorCode + 256))
                        } else {
                            spiErrorHandling(new SpiError(errorCode + 256), errorPos, moduleAt(errorPos))
                        }
                    }
                    break

                default:
                    throw new SpiError(SpiErrorType.InvalidCommand)
            }
        } catch (error) {
            if (error instanceof SpiError) spiControllerErrorHandling(error)
            else throw error
        }
    } else {
        const module = moduleAt(msg.pos)
        try {
            if (msg.cmd === Commands.moduleInitialize) {
                if (msg.data.length !== 2)
                    throw new SpiError(SpiErrorType.InvalidDataLengthFromModule)

                const type: ModuleType = msg.data[0]
                const version: number = msg.data[1]

                if (module && module.type === type && module.version === version) {
                    // module already exists and is the same
                    logger.info(`module at pos ${msg.pos} already initialized`)
                    module.forceUpdate(false)
                } else if (getGameState() === "playing") {
                    // do not change modules while playing
                    throw new SpiError(SpiErrorType.ModuleAddedInGame, `Module ${moduleTypeToString(type, version)} at pos ${msg.pos}`)
                } else {
                    // change module to match initialization
                    if (module) {
                        // module already exists, but is not the same
                        removeModuleAt(msg.pos, true)
                        createModuleAt(type, version, msg.pos)
                    } else {
                        // module does not exist
                        createModuleAt(type, version, msg.pos)
                    }
                }
            } else {
                if (!module)
                    throw new SpiError(SpiErrorType.ModuleNotInitialized)
                module.receivedMessage(msg)
            }
        } catch (error) {
            if (error instanceof SpiError) spiErrorHandling(error, msg.pos, module)
            else throw error
        }
    }
}

const lastUpdate: Array<Date | null> = fillArray(13, null)
// const firstRequest: Array<Date | null> = fillArray(13, null);
function checkRequestAllowed(position: SpiModulePosition): boolean {
    // when last Update was less than 1 second ago, ignore
    const last = lastUpdate[position]
    if (last && Date.now() - last.getTime() < 1000) return false

    // lastUpdate[position] = null

    // // when first request was less than 50ms or more than 10s ago, ignore
    // let first = firstRequest[position];
    // if (!first) {
    //     first = new Date();
    //     firstRequest[position] = first;
    //     return false
    // }
    // if (Date.now() - first.getTime() < 50) return false
    // firstRequest[position] = null
    // if (Date.now() - first.getTime() > 10000) return false

    lastUpdate[position] = new Date()
    return true
}

const firstMissing: Array<Date | null> = fillArray(13, null)
function checkRemoveAllowed(position: SpiModulePosition): boolean {
    // when first missing was less than 2s ago, ignore
    let first = firstMissing[position]
    if (!first) {
        first = new Date()
        firstMissing[position] = first
        return false
    }
    if (Date.now() - first.getTime() < 2000) return false
    firstMissing[position] = null
    return true
}

function requestModuleReset(position: SpiModulePosition) {
    if (!checkRequestAllowed(position)) return

    logger.warn("resetting module at position " + position)
    sendMessage({ pos: position, cmd: Commands.moduleReset, data: [] })
}

function requestModuleForceUpdate(position: SpiModulePosition) {
    const module = moduleAt(position)
    if (!module) throw new Error("no module at position " + position)

    if (!checkRequestAllowed(position)) return

    logger.warn("forcing module update")
    module.forceUpdate()
}

function spiErrorHandling(error: SpiError, pos: SpiModulePosition, module: Module | null) {
    logger.error(`SPI error on pos ${pos} (${moduleTypeToString(module?.type, module?.version)}) type ${SpiErrorType[error.type]}: ${error.message}`)

    if ([
        SpiErrorType.InvalidCommand,
        SpiErrorType.InvalidCommandFromModule,
        SpiErrorType.InvalidDataLength,
        SpiErrorType.InvalidDataLengthFromModule,
        SpiErrorType.ModuleNotInitialized,
    ].includes(error.type)) { // hard error, reset module
        if (getGameState() === "playing" && !module) return
        requestModuleReset(pos)
    } else if (error.type === SpiErrorType.OtherModuleAlreadyExists) {
        if (getGameState() === "playing") {
            // if playing, ignore and wait for module to fix itself
            requestModuleForceUpdate(pos)
        } else {
            // if not playing, remove wrong module
            if (checkRemoveAllowed(pos)) {
                logger.warn("removing wrong module")
                removeModuleAt(pos)
                requestModuleReset(pos)
            } else {
                requestModuleForceUpdate(pos)
            }
        }
    } else if ([
        SpiErrorType.CRCError,
        SpiErrorType.CRCErrorFromModule,
    ].includes(error.type)) { // CRC error
        if (module) {
            module.error_counter++
            if (module.error_counter > 10) {
                requestModuleReset(pos)
            } else {
                requestModuleForceUpdate(pos)
            }
        } else {
            requestModuleReset(pos)
        }
    }
}

function spiControllerErrorHandling(error: SpiError) {
    logger.error(`SPI error on controller type ${SpiErrorType[error.type]}: ${error.message}`)
}
