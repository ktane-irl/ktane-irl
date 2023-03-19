// SECONDS LEFT
export type secondsLeftType = number

// ERROR LED
export type strikeLedType = [boolean, boolean]

// CONFIGURATION
export type ClockConfiguration = {
    secondsLeft: secondsLeftType,
    strikeLed: strikeLedType,
}
