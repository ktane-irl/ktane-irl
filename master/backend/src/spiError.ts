
export enum SpiErrorType {
    // created by Firmware code
    NoError = 0,
    CRCError = 1,
    InvalidCommand = 2,
    InvalidDataLength = 3,
    AcknowledgeError = 4,
    BufferOverflow = 5,
    DisplayConnectionError = 10,

    // created by C++ controller code
    ControllerNoError = 256 + 0,
    CRCErrorFromModule = 256 + 1,
    ZeroLengthFromModule = 256 + 2,
    InvalidPositionFromBackend = 256 + 10,

    // created by TS code
    BackendNoError = 512 + 0,
    InvalidCommandFromModule = 512 + 1,
    InvalidDataLengthFromModule = 512 + 2,
    OtherModuleAlreadyExists = 512 + 3,
    ModuleTypeNotSupported = 512 + 4,
    ModuleNotInitialized = 512 + 5,
    ModuleAddedInGame = 512 + 6,
    ModuleRemovedInGame = 512 + 7,
    InvalidPositionFromController = 512 + 8,
}

export class SpiError extends Error {
    public readonly type: SpiErrorType
    public readonly innerText: string

    constructor(type: SpiErrorType, text?: string) {
        if (text) {
            super(`SPI Error: ${SpiErrorType[type]} (${text})`)
        } else {
            super(`SPI Error: ${SpiErrorType[type]}`)
        }
        this.type = type
        this.innerText = text || ""
    }
}
