import net from "net"
import { Emitter } from "./events"
import { isTestMode } from "./helper"
import { ConsoleLogger } from "./logger"
import { TcpError } from "./tcpError"
import { SpiMessageToString, SpiMessageType } from "./types/spi"

const logger = new ConsoleLogger("TCP")

export const connectionOptions: net.NetConnectOpts = {
    port: 3001,
    host: "172.16.27.74",
    timeout: 5000,
}

export const messageEmitter = new Emitter<{
    // ... -> TCP -> Module
    received: (msg: SpiMessageType) => void,
    // TCP -> Module
    tcpError: (error: TcpError) => void,
    // Module -> TCP -> ...
    send: (msg: SpiMessageType) => void,
}>

const spiEmitter = new Emitter<{
    // IN
    received: (data: Buffer) => void,
    connected: () => void,
    disconnected: () => void,
    // OUT
    send: (data: Buffer) => void,
    reconnect: () => void,
}>
export function getSpiEmitterForTesting() {
    if (!isTestMode()) throw new Error("getSpiEmitterForTesting can only be called in test mode")
    return spiEmitter
}

messageEmitter.on("send", (msg: SpiMessageType) => {
    logger.log("SENDING  frame: " + SpiMessageToString(msg))
    const buffer = Buffer.from([msg.pos, msg.cmd, msg.data.length, ...msg.data])
    spiEmitter.emit("send", (buffer))
})

spiEmitter.on("received", (buffer) => { // [CMD, LEN, DATA, POS]
    // print hex data
    // create SpiMessageType
    try {
        for (let i = 0; i < buffer.length; i) {
            if (buffer.length - i < 3) throw new TcpError("Buffer too short for header: " + buffer.toString("hex") + " at " + i)
            const pos = buffer[i++]
            if (pos > 12 && pos != 255) throw new TcpError("Invalid position: " + pos)
            const cmd = buffer[i++]
            const len = buffer[i++]
            if (buffer.length - i < len) throw new TcpError("Buffer too short for data: " + buffer.toString("hex") + " at " + i)
            const data: Uint8Array = buffer.slice(i, i + len)
            i += len

            const frame: SpiMessageType = { cmd, data: Array.from(data), pos }
            logger.log("RECEIVED frame: " + SpiMessageToString(frame))
            messageEmitter.emit("received", frame)
        }
    } catch (error) {
        if (error instanceof TcpError) {
            logger.error("TCP Error: " + error.message)
            messageEmitter.emit("tcpError", error)
            spiEmitter.emit("reconnect")
        } else {
            throw error
        }
    }
})

export default function startTcp() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let connected = false

    logger.log("connecting via TCP...")
    const client = net.createConnection(connectionOptions)

    client.on("connect", () => {
        logger.info("connected via TCP socket!")
        connected = true
        spiEmitter.emit("connected")
    })

    client.on("data", (data) => {
        // logger.debug("data from TCP: " + data.toString("hex"));
        spiEmitter.emit("received", data)
    })

    spiEmitter.on("send", (data) => {
        // logger.debug("data to TCP: " + data.toString("hex"));
        client.write(data)
    })

    spiEmitter.on("reconnect", () => {
        logger.warn("restarting connection to TCP triggered")
        client.destroy()
    })

    client.on("error", (err) => {
        logger.error("error from TCP: " + err)
    })

    client.on("close", () => {
        connected = false
        logger.error("TCP connection closed")
        spiEmitter.emit("disconnected")
        setTimeout(() => {
            client.connect(connectionOptions)
        }, 5000)
    })

    spiEmitter.on("connected", () => {
        //!DEBUG
    })
}
