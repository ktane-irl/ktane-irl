export enum ConfigurationErrorType {
    ArrayLengthMismatch,
    ConfigNotPossible,
}

export class ConfigurationError extends Error {
    public readonly type: ConfigurationErrorType
    public readonly configKey: string
    public readonly text?: string
    constructor(
        type: ConfigurationErrorType,
        configKey: string,
        text?: string
    ) {
        if (text) {
            super(`Configuration Error: ${ConfigurationErrorType[type]} (${text})`)
        } else {
            super(`Configuration Error: ${ConfigurationErrorType[type]}`)
        }
        this.type = type
        this.configKey = configKey
        this.text = text
    }
}

