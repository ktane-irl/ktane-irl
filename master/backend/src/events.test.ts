import { describe, expect, test } from "@jest/globals"
import { Emitter } from "./events"

describe("Emitter", () => {
    test("Emitter test", () => {

        const exampleEmitter = new Emitter<{
            foo: (a: string) => string,
            foobar: (a: number, b: string) => void,
        }>()

        const foo: string[] = []

        expect(exampleEmitter.emit("foo", "notCalled")).toEqual([])

        const handler = exampleEmitter.on("foo", (a) => {
            foo.push(a)
            return "bar"
        })

        expect(foo).toEqual([])

        expect(exampleEmitter.emit("foo", "A")).toEqual(["bar"])
        expect(foo).toEqual(["A"])

        exampleEmitter.emit("foobar", 1, "B")
        expect(foo).toEqual(["A"])

        handler.off()
        exampleEmitter.emit("foo", "A")
        expect(foo).toEqual(["A"])
    })
})
