/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk, { Chalk } from "chalk"
import { appendFile, readdir, unlink } from "fs"
import { Logger } from "ts-log"

function padCenter(str: string, len: number) {
    return str.padStart(str.length + Math.floor((len - str.length) / 2)).padEnd(len)
}

const folderInitDone = new Promise<void>((res) => {
    // delete all files in logs
    readdir("logs", async (err, files) => {
        if (!err)
            await Promise.all(files.map(file => new Promise((res) => { unlink(`logs/${file}`, res) })))
        res()
    })
})

export class ConsoleLogger implements Logger {
    public static colors: Chalk[] = [
        chalk.cyan,
        chalk.magenta,
        chalk.green,
        chalk.black,
        chalk.red,
        chalk.yellow,
        chalk.blue,
        chalk.white,
    ]
    static maxNameLength = 0

    public getTime(): string {
        // HH:MM:SS.mmm
        const date = new Date()
        return date.toLocaleTimeString() + "." + date.getMilliseconds().toString().padStart(3, "0")
    }

    public readonly filename: string
    public readonly color: Chalk
    public constructor(private name: string) {
        // select a foreground color and remove it from the list
        this.color = ConsoleLogger.colors.shift() || chalk.whiteBright
        ConsoleLogger.maxNameLength = Math.max(ConsoleLogger.maxNameLength, name.length)
        this.filename = `logs/${name}.ans`
        appendFile(this.filename, "\n\nSTARTED " + this.getTime() + "\n", () => { return })
    }

    public trace(message?: any, ...optionalParams: any[]): void {
        this.append("TRACE", chalk.cyan, chalk.white, message, ...optionalParams)
    }

    public debug(message?: any, ...optionalParams: any[]): void {
        this.append("DEBUG", chalk.cyan, chalk.white, message, ...optionalParams)
    }

    public log(message?: any, ...optionalParams: any[]): void {
        this.append(" LOG ", chalk.white, chalk.white, message, ...optionalParams)
    }
    public info(message?: any, ...optionalParams: any[]): void {
        this.append("INFO ", chalk.blue, chalk.white, message, ...optionalParams)
    }

    public warn(message?: any, ...optionalParams: any[]): void {
        this.append("WARN ", chalk.yellow, chalk.yellow, message, ...optionalParams)
    }

    public error(message?: any, ...optionalParams: any[]): void {
        this.append("ERROR", chalk.red, chalk.red, message, ...optionalParams)
    }

    protected async append(type: string, colorType: Chalk, colorText: Chalk, message: string, ...optionalParams: any[]) {
        const msg = `[${this.getTime()}] [${colorType(type)}] [${this.color(padCenter(this.name, ConsoleLogger.maxNameLength))}] ${colorText(message)}`
        console.log(msg, ...optionalParams)
        const params = JSON.stringify(optionalParams)
        await folderInitDone
        appendFile(this.filename, msg + (
            params === "[]" ? "" : " " + params
        ) + "\n", () => { return })
    }
}

export class ModuleLogger extends ConsoleLogger {

    constructor(private moduleName: string, pos: number) {
        super("POS " + pos)
    }

    protected async append(type: string, colorType: Chalk, colorText: Chalk, message: string, ...optionalParams: any[]) {
        super.append(type, colorType, colorText, this.moduleName + ": " + message, ...optionalParams)
    }
}
