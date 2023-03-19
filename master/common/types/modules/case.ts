// SERIAL NUMBER
export type serialNumberType = string

// INDICATOR
export enum indicatorTextValues {
    Empty = "Empty",
    SND = "SND",
    CLR = "CLR",
    CAR = "CAR",
    IND = "IND",
    FRQ = "FRQ",
    SIG = "SIG",
    NSA = "NSA",
    MSA = "MSA",
    TRN = "TRN",
    BOB = "BOB",
    FRK = "FRK",
}
export type indicatorValidTextValues = Exclude<indicatorTextValues, indicatorTextValues.Empty>

export type indicatorTextType = indicatorTextValues[]
export type indicatorLedType = boolean[]

// BATTERY
export type batteryType = boolean[]

// PORTS
export enum portKeys {
    DVI_D = "DVI-D",
    Parallel = "Parallel",
    PS_2 = "PS/2",
    RJ_45 = "RJ-45",
    Serial = "Serial",
    Cinch = "Cinch",
}
export type portType = Record<portKeys, boolean>

// CONFIGURATION
export type CaseConfiguration = {
    serialNumber: serialNumberType, 
    indicatorText: indicatorTextType, 
    indicatorLed: indicatorLedType, 
    batteries: batteryType, 
    ports: portType, 
}
// export type CaseConfigTypes = ConfigTypes<CaseConfiguration>
