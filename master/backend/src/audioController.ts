import { ConsoleLogger } from "./logger"

const logger = new ConsoleLogger("AUDIO")

import playerConstructor from "play-sound"
const player = playerConstructor({})

export enum Sounds {
    TICK = "sounds/clock_tick.wav",
    GAME_START = "sounds/56229__pera__3beeps.wav",
    GAME_STRIKE = "sounds/142608__autistic-lucario__error.wav",
    GAME_FAILED = "sounds/bomb_explode.wav",
    GAME_SOLVED = "sounds/521949__kastenfrosch__success-jingle.wav",
    BUTTON_CLICK = "sounds/268108__nenadsimic__button-tick.wav",
}


export function playSound(sound: Sounds) {
    if (![Sounds.GAME_START, Sounds.GAME_SOLVED, Sounds.GAME_FAILED, Sounds.GAME_STRIKE].includes(sound)) return

    logger.debug("PLAYING " + sound)


    player.play(sound, { timeout: 1000 }, () => {
        logger.debug("SOUND PLAYED")
    })
}
