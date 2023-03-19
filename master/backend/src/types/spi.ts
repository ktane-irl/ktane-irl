import { SpiModulePosition } from "../../../common/types/spi"

export type ModuleMessageType = { cmd: number, data: number[] }
export type SpiMessageType = { pos: SpiModulePosition } & ModuleMessageType


function padByte(byte: number) {
    return byte.toString(16).padStart(2, "0")
}
/**
 * concerts SpiMessageType to a string
 * @param msg SpiMessageType
 * @returns string
 */
export function SpiMessageToString(msg: ModuleMessageType | SpiMessageType) {
    return `${"pos" in msg ? `pos: ${padByte(msg.pos)}, ` : ""}cmd: ${padByte(msg.cmd)}, data: ${msg.data.map(d => padByte(d)).join("-")}`
}
