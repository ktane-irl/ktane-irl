import { QuestConfiguration } from "./quest"

//* Insert Type definitions here

// Test Read
export type TestReadType = number

// Test Write
export type TestWriteType = boolean

// CONFIGURATION
export type TemplateConfiguration = { //* Rename this type
    //* Add all configuration values here
    testRead: TestReadType
    testWrite: TestWriteType
} & QuestConfiguration
