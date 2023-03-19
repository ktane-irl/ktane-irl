import { describe, expect, test } from "@jest/globals"
import { ConfigTypes, ModuleType } from "../../../common/types/module"
import { Emitter } from "../events"
import { notUndefined } from "../helper"
import { ModuleMessageType } from "../types/spi"
import { SpecificModule, SpecificModuleEvents } from "./specificModule"

// TYPE SPECIFIC
export type TestConfiguration = {
    test: string;
    read: number;
    write: boolean;
}

// TYPE SPECIFIC
export type CaseEvents = SpecificModuleEvents<TestConfiguration>

const sentMessages: ModuleMessageType[] = []

// MODULE SPECIFIC
enum TestCommands {
    writeSet = 0x01,
    readGet = 0x02,
}

class TestModule extends SpecificModule<TestConfiguration> {
    public readonly emitter: Emitter<CaseEvents> = new Emitter

    // TYPE SPECIFIC
    readonly types: ConfigTypes<TestConfiguration> = {
        test: "UNKNOWN",
        read: "READ",
        write: "WRITE",
    }

    constructor(version: number) {
        super(ModuleType.NoModule, version, 0)

        this.emitter.on("writeTargetChange", () => this.updateWrite(true))
    }


    // TYPE SPECIFIC
    protected validateConfig(config: Partial<TestConfiguration>): void {
        if (notUndefined(config.test) && config.test.length > 5)
            throw new Error("Test is too long")
    }

    // TYPE SPECIFIC
    public configGenerate(): TestConfiguration {
        return {
            test: "test",
            read: 1,
            write: true,
        }
    }


    // ONLY FOR TEST
    sendMessage(msg: ModuleMessageType) {
        sentMessages.push(msg)
    }

    // MODULE SPECIFIC (ALL OF SPI)
    //SPI
    protected update(force = false) {
        this.updateWrite(force)
    }

    updateWrite(force: boolean) {
        const target = this.getIfDirty("write", force)
        if (target === undefined) return

        // send to spi
        this.sendMessage({ cmd: TestCommands.writeSet, data: [target ? 1 : 0] })

        // set state
        this.setState("write", target)
    }

    moduleReceivedMessage(msg: ModuleMessageType) {
        switch (msg.cmd) {
            case TestCommands.readGet:
                this.setState("read", msg.data[0])
                return true
        }
        return false
    }

    protected setPlayState(): void {
        return
    }
}


describe("TestModule inner logic", () => {

    const module = new TestModule(1)

    test("check initial state", () => {
        expect(module.version).toBe(1)
        expect(module.type).toBe(ModuleType.NoModule)
        expect(module.getState()).toEqual({})
        expect(module.getTarget()).toEqual({})
        expect(module.isDirty("read", false)).toBe(false)
        expect(module.isDirty("write", false)).toBe(false)
        expect(module.isDirty("test", false)).toBe(false)
        expect(module.isDirty("read", true)).toBe(false)
        expect(module.isDirty("write", true)).toBe(false)
        expect(module.isDirty("test", true)).toBe(false)
        expect(sentMessages).toEqual([])
    })

    test("check config generate and target set", () => {
        const config = module.configGenerate()
        expect(config).toEqual({
            test: "test",
            read: 1,
            write: true,
        })
        module.setTarget(config)
        expect(module.getTarget()).toEqual(config)
    })

    test("check UNKNOWN (test) state", () => {
        expect(module.getState().test).toBeUndefined()
        expect(module.isDirty("test", false)).toBe(true)
        expect(module.isDirty("test", true)).toBe(true)

        module.defineState("test", "test")

        expect(module.getState().test).toBe("test")
        expect(module.isDirty("test", false)).toBe(false)
        expect(module.isDirty("test", true)).toBe(true)
    })

    test("check READ (read) state", () => {
        expect(module.getState().read).toBeUndefined()
        expect(module.isDirty("read", false)).toBe(true)
        expect(module.isDirty("read", true)).toBe(true)

        // invalid command
        expect(module.moduleReceivedMessage({ cmd: 255, data: [1] })).toBe(false)
        // correct command
        expect(module.moduleReceivedMessage({ cmd: TestCommands.readGet, data: [1] })).toBe(true)

        expect(module.getState().read).toBe(1)
        expect(module.isDirty("read", false)).toBe(false)
        expect(module.isDirty("read", true)).toBe(true)
    })

    test("check WRITE (write) state", () => {
        expect(module.getState().write).toBe(true)
        expect(module.isDirty("write", false)).toBe(false)
        expect(module.isDirty("write", true)).toBe(true)
        expect(sentMessages).toEqual([{ cmd: TestCommands.writeSet, data: [1] }])
    })

})
