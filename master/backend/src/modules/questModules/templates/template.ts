import { ModuleType } from "../../../../../common/types/module"
import { Emitter } from "../../../events"
import { ConfigurationError, ConfigurationErrorType } from "../../configurationError"
import { QuestModule, QuestModuleConfigType, QuestModuleEvents } from "../questModule"

import { TemplateConfiguration } from "../../../../../common/types/modules/questModules/template" //* Change to the correct configuration type
import { notUndefined } from "../../../helper"

// EVENTS
export type TemplateEvents = { //* Rename this type
    //* add specific events here, if needed
} & QuestModuleEvents<TemplateConfiguration> //* Change to the correct configuration type

export type TemplateConfigType = QuestModuleConfigType & { //* Rename this type
    //* add the correct configuration type possibilities here, 
    //* could be READ, WRITE, UNKNOWN or any combination of these
    //* or INTERNAL for variables that are just used internally
    testRead: "READ"
    testWrite: "WRITE"
}

export abstract class Template extends QuestModule<TemplateConfiguration> { //* Rename this type

    public readonly emitter: Emitter<TemplateEvents> = new Emitter //* Rename this type

    abstract readonly types: TemplateConfigType //* Rename this type

    constructor(
        version: number,
        pos: number,
    ) {
        super(ModuleType.NoModule, version, pos) //* add the correct module type
    }

    //* this.logger should be used for all module logging

    // STATE - TARGET

    protected validateConfig(config: Partial<TemplateConfiguration>): void {
        //* add validation for the configuration values in the following way:
        if (notUndefined(config.statusLed) && /*something is wrong with this config value*/ true)
            throw new ConfigurationError(ConfigurationErrorType.ConfigNotPossible, "template")
    }

    public configGenerate(): TemplateConfiguration { //* Rename this type
        //* calculate a random configuration and return it
        return {
            statusLed: { red: false, green: false },
            //* add the correct configuration values
            testRead: Math.round(Math.random() * 10),
            testWrite: Boolean(Math.round(Math.random())),
        }
    }

    // PLAY
    protected setPlayState() {
        //* write all the code that is needed to play the module here

        //* Use this.emitter.on or .once to listen to events, and this.emitter.emit to trigger events
        //* all types already have changeState and changeTarget events, you can just use them here
        //* it is best to just use the autocomplete to find the correct events

        //* all Events need to be added to the playDisposables by doing this:
        this.addPlayDisposable(this.emitter.on("testReadStateChange", (now, old) => {
            this.logger.log("processing test state change", now, old)

            if (/* check if the correct event was triggered */ now > 5) {
                //* call this function if the module was solved
                this.handleSolved()
            } else {
                //* call this function if an error was made by the user
                this.handleFailed()
            }
        }).off)

    }
}
