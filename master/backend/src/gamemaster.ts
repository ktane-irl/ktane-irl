import { GameState } from "./types/game"

let gameState: GameState = "test_idle"

export function getGameState(): GameState {
    return gameState
}

export function setGameState(state: GameState): void {
    gameState = state
    for (const callback of callbacks) {
        callback(state)
    }
}

export const gameConfig = {
    seconds: 300,
}


const callbacks: Array<(state: GameState) => void> = []
export function onGameStateChange(callback: (state: GameState) => void): void {
    callbacks.push(callback)
}
