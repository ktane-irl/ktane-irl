import express, { } from "express";
import { getGameState, setGameState } from "../../gamemaster";
import { ConsoleLogger } from "../../logger";
import { GameState } from "../../types/game";

export const router = express.Router();

export const logger = new ConsoleLogger("ApiLogger");

export const gameState = {
    gamemode: "playing"
}


router.get('/play/SetGameState', (req, res) => {

    if (process.env.apiDummyMode === "true") {

        //For dummy-mode
        res.send(gameState);
        logger.log("Send dummy-mode gamestate = " + gameState);

    }
    else {


        let actualGameState: GameState = getGameState();

        if (actualGameState !== null) {

            res.send({ "gamemode": actualGameState });
            logger.log("Actual gameState = " + actualGameState);

        }
        else {
            res.status(400).send("No gameState defined");
            logger.error("No gameState defined!!!");
        }
    }
});

router.put('/play/SetGameState', (req, res) => {

    if (process.env.apiDummyMode === "true") {

        //For dummy-mode
        gameState.gamemode = req.body.gamemode;
        res.send(gameState);
        logger.log("Modify dummy-mode gameState/ New dummy-mode gamestate = " + gameState.gamemode)
    }
    else {

        var newGameState: GameState = req.body.gamemode;

        setGameState(newGameState);

        res.send({ "gamemode": newGameState });
        logger.log("New gameState = " + newGameState)
    }
});

export default router;