
import { ModuleMessageType } from "../../../types/spi"
import { SpiError, SpiErrorType } from "../../../spiError"

import { Template, TemplateConfigType } from "./template" //* Rename to class name

export enum Te01Commands { //* Rename this type
    //* add all commands from the SPI manual here
    testGet = 0x02,
    testSet = 0x03,
}

export class Te01 extends Template { //* Rename this class

    readonly types: TemplateConfigType = { //* Rename this type
        //* add the actual implemented types here
        statusLed: "WRITE",
        testRead: "READ",
        testWrite: "WRITE",
    }

    constructor(pos: number) {
        super(1, pos)
        //* add all TargetChange listeners of WRITE types here
        this.emitter.on("statusLedTargetChange", () => this.updateStatusLed(false))
        this.emitter.on("testWriteTargetChange", () => this.updateTestWrite(false))
    }

    // SPI
    protected update(force = false) {
        //* add all WRITE update functions here
        this.updateStatusLed(force)
        this.updateTestWrite(force)
    }

    // SPI WRITE
    //* add all WRITE update functions here
    private updateTestWrite(force = false) {
        //* update the WRITE type in this schema:
        const target = this.getIfDirty("testWrite", force)
        if (target === undefined) return

        // send to spi
        this.sendMessage({
            cmd: Te01Commands.testSet, data: [ //* change the command
                target ? 1 : 0 //* change the data
            ]
        })
        // update state
        this.setState("testWrite", target)
    }

    // SPI READ
    moduleReceivedMessage(msg: ModuleMessageType): boolean {
        switch (msg.cmd) {
            //* add all READ commands from the SPI manual here in this schema:
            case Te01Commands.testGet:
                msg.data.shift()//! remove the first byte
                if (msg.data.length !== 1) //* check the length of the data
                    throw new SpiError(SpiErrorType.InvalidDataLengthFromModule, `Te01.testGet ${msg.data.length} != 1`)

                //* set the state
                this.setState("testRead", msg.data[0])
                return true
            default:
                return false
        }
    }
}
