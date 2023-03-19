import startApi from "./API/api"
import connectModuleToSpi from "./moduleController"
import startTcp, { messageEmitter } from "./tcp"

startApi()

startTcp()

// connect moduleController to spi
messageEmitter.on("received", connectModuleToSpi((msg) => messageEmitter.emit("send", msg)))
