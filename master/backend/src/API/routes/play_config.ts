import express from "express";
import { validateAvailableModules } from "./joi-check/play_config_validation";
import { gameConfig } from "../../gamemaster";
import { ConsoleLogger } from "../../logger";
export const router = express.Router();

export const logger = new ConsoleLogger("ApiLogger");

export type ConstructionKit = {
    available_modules: Array<{ name: string, count: number }>;
    count_of_wished_modules: number,
    severity_level: number,
    seconds_to_play: number
};

export const construction_kit: ConstructionKit = {

    available_modules: [
        { name: "Wires", count: 0 },
        { name: "TheButton", count: 0 },
        { name: "Keypads", count: 0 },
        { name: "SimonSays", count: 0 },
        { name: "WhosOnFirst", count: 0 },
        { name: "Memory", count: 0 },
        { name: "MorseCode", count: 0 },
        { name: "ComplicatedWires", count: 0 },
        { name: "WireSequences", count: 0 },
        { name: "Mazes", count: 0 },
        { name: "Passwords", count: 0 },
        { name: "VentingGas", count: 0 },
        { name: "CapacitorDischarge", count: 0 },
        { name: "Knobs", count: 0 }
    ],
    count_of_wished_modules: 2,
    severity_level: 1,
    seconds_to_play: 30
};

export let generatedPlayConfiguration: Array<string> = [];

router.put('/play/config', (req, res) => {

    const validateResult = validateAvailableModules(req.body);
    let countOfAvailableModules: number = 0;

    if (validateResult.error) {
        res.status(400).send(validateResult.error);
        return;
    }

    for (let i = 0; i < req.body.available_modules.length; i++) {

        countOfAvailableModules += req.body.available_modules[i].count;
    }

    if (countOfAvailableModules < req.body.count_of_wished_modules) {
        res.status(400).send("Play config/ Available modules is less then count of wished modules/ Available modules = " + countOfAvailableModules + " /Count of wished modules = " + req.body.count_of_wished_modules);
        logger.error("Play config/ Available modules is less then count of wished modules/ Available modules = " + countOfAvailableModules + " /Count of wished modules = " + req.body.count_of_wished_modules)
        return;
    }



    construction_kit.available_modules = req.body.available_modules;
    construction_kit.count_of_wished_modules = req.body.count_of_wished_modules;
    construction_kit.severity_level = req.body.severity_level;
    construction_kit.seconds_to_play = req.body.seconds_to_play;

    generatedPlayConfiguration = generateModulesForPlayConfig(construction_kit);
    gameConfig.seconds = construction_kit.seconds_to_play;
    res.send(generatedPlayConfiguration);
    logger.log("Create play config");

});

function generateModulesForPlayConfig(construction_kit: ConstructionKit): Array<string> {

    const availableModuleArray = transferObjectToArray(construction_kit)
    let generatedModuleArray: Array<string> = []

    generatedModuleArray = generateArrayOfRandomItems(availableModuleArray, (construction_kit.count_of_wished_modules), 0, (construction_kit.available_modules.length - 1))

    return generatedModuleArray
}

function generateArrayOfRandomItems(passedArray: Array<any>, countOfWishedElements: number, start: number, end: number): Array<any> {

    const randomModuleArray: string[] = []
    const randomNumberArray = generateUniqueRandomNumbersArray(countOfWishedElements, start, (passedArray.length - 1),)

    for (let i = 0; i < countOfWishedElements; i++) {

        randomModuleArray[i] = passedArray[randomNumberArray[i]]

    }

    return randomModuleArray

}

function generateUniqueRandomNumbersArray(count: number, start: number, end: number, skipNumber?: number): Array<number> {

    const randomNumber: number[] = []

    if (typeof skipNumber !== "undefined") {
        while (randomNumber.length < count) {
            const rands = Math.floor(Math.random() * (end + 1) + start)
            if ((randomNumber.indexOf(rands) === -1) && (rands !== skipNumber)) {
                randomNumber.push(rands)
            }
        }

        return randomNumber
    }
    else {

        while (randomNumber.length < count) {
            const rands = Math.floor(Math.random() * (end + 1) + start)
            if (randomNumber.indexOf(rands) === -1) {
                randomNumber.push(rands)
            }
        }

        return randomNumber

    }
}
function transferObjectToArray(construction_kit: ConstructionKit): Array<string> {

    const availableModuleArray: string[] = []
    let totalCountOfModules = 0
    let arrayIndex = 0

    //Check total count of modules is higher then count_of_wished_modules
    for (let i = 0; i < construction_kit.available_modules.length; i++) {

        totalCountOfModules += construction_kit.available_modules[i].count
    }


    if (totalCountOfModules >= construction_kit.count_of_wished_modules) {

        for (let i = 0; i < construction_kit.available_modules.length; i++) {

            let j = 1

            while (construction_kit.available_modules[i].count !== 0 && j <= construction_kit.available_modules[i].count) {
                availableModuleArray[arrayIndex] = construction_kit.available_modules[i].name

                arrayIndex++
                j++

            }

        }

        return availableModuleArray
    }
    else {
        throw Error("Total count of available modules is less then count of wished modules!!!")
    }
}

export function generateRandomNumbersArray(count: number, start: number, end: number): Array<number> {

    const randomNumber: number[] = []
    while (randomNumber.length < count) {
        const rands = Math.floor(Math.random() * (end + 1) + start)
        randomNumber.push(rands)
    }

    return randomNumber
}

export function generateRandomBooleanArray(count: number): Array<boolean> {

    const randomNumber: Array<number> = []
    let randomBoolean: Array<boolean> = []

    while (randomNumber.length < count) {
        const rands = Math.floor(Math.random() * (2))
        randomNumber.push(rands)
    }

    randomBoolean = randomNumber.map(numberToBoolean)

    return randomBoolean
}

function numberToBoolean(value: number): boolean {

    if (value <= 1) {
        if (value === 0) {
            return false
        }
        else {
            return true
        }
    }
    else {
        throw Error("Given function parameter is greater then 1/ function parameter = " + value)
    }
}

router.get('/play/config', (req, res) => {

    res.send(generatedPlayConfiguration);
    logger.log("Sent play config");

});


export default router;
