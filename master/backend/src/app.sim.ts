import { ModuleType } from "../../common/types/module"
import startApi from "./API/api"
import { ConsoleLogger } from "./logger"
import connectModuleToSpi from "./moduleController"
import { Ca01Commands } from "./modules/00-case/ca01"
import { Ma01Commands } from "./modules/questModules/11-mazes/ma01"
import { Ss01Commands } from "./modules/questModules/05-simonSays/ss01"
import { Wi01Commands } from "./modules/questModules/02-wires/wi01"
import { SpiMessageType } from "./types/spi"

startApi()

const logger = new ConsoleLogger("simulator")

function messageSend(msg: SpiMessageType) {
    // send message to spi
    logger.log("SEND  ", msg)
}

const _messageReceived = connectModuleToSpi(messageSend)

function messageReceived(msg: SpiMessageType) {
    // receive message from spi
    logger.log("RECV  ", msg)
    _messageReceived(msg)
}

enum Commands {
    errorCode = 0xFE,
    moduleInitialize = 0xFD,
    moduleReset = 0xFC,
}


setTimeout(() => {
    // connect ClockModule v1 at pos 0
    messageReceived({ pos: 0, cmd: Commands.moduleInitialize, data: [ModuleType.ClockModule, 1] })

    // connect Case v1 at pos 1
    messageReceived({ pos: 1, cmd: Commands.moduleInitialize, data: [ModuleType.Case, 1] })
    messageReceived({ pos: 1, cmd: Ca01Commands.batteryGet, data: [0, 0b100011] })

    // connect Wires v1 at pos 2
    messageReceived({ pos: 2, cmd: Commands.moduleInitialize, data: [ModuleType.Wires, 1] })
    messageReceived({ pos: 2, cmd: Wi01Commands.colorsGet, data: [0, 0b110000, 0b000000, 0b000001] })

    // connect SimonSays v1 at pos 3
    messageReceived({ pos: 3, cmd: Commands.moduleInitialize, data: [ModuleType.SimonSays, 1] })
    messageReceived({ pos: 3, cmd: Ss01Commands.ButtonsGet, data: [0, 0b1011] })

    // connect Mazes v1 at pos 4
    messageReceived({ pos: 4, cmd: Commands.moduleInitialize, data: [ModuleType.Mazes, 1] })
    messageReceived({ pos: 4, cmd: Ma01Commands.buttonsGet, data: [0, 0b1011] })

}, 1000)
