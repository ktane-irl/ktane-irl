import express, { } from "express";
import { ModuleType } from "../../../../common/types/module";
import { checkModuleType } from "../../helper";
import { ConsoleLogger } from "../../logger";
import { moduleAt } from "../../moduleController";
import { validateParameterTuple } from "./joi-check/uri_parameter";
export const router = express.Router();

const logger = new ConsoleLogger("ApiLogger");

export const mazes = {

    button: {
        top: true,
        right: false,
        bottom: false,
        left: false
    },
    wallMatrix: [
        [false, false, false, false, false, true],
        [false, false, false, false, true, false],
        [false, false, false, true, false, false],
        [false, false, true, false, false, false],
        [false, true, false, false, false, false],
        [true, false, false, false, false, false]
    ],
    special: {
        circle1: { x: 1, y: 2 },
        circle2: { x: 3, y: 4 },
        player: { x: 5, y: 0 },
        target: { x: 0, y: 0 }
    },
    statusLed: {
        red: true,
        green: false
    }

}

router.get('/Mazes/:version/:slot', (req, res) => {

    if (process.env.apiDummyMode === "true") {
        //For dummy-mode
        const uri = req.path.split('/');

        res.send(mazes);
        logger.log(" Create dummy data for module " + uri[1]);
    }
    else {
        const validateParameterResult = validateParameterTuple(req.params);
        const module = moduleAt(parseInt(req.params.slot));
        const uri = req.path.split('/');


        if (validateParameterResult.error) {
            res.status(400).send(validateParameterResult.error);
            logger.error(uri[1] + " uri parameter/ " + validateParameterResult.error);
            return;
        }

        if (module === null) {

            res.status(400).send("No module connected at slot: " + req.params.slot);
            logger.error("No module connected at slot: " + req.params.slot);
            return;
        }
        else {
            logger.log("Module " + uri[1] + " detected at slot: " + req.params.slot);
        }

        if (module.version !== parseInt(req.params.version)) {

            res.status(400).send("The version does not match/ Version of the module = " + module.version);
            logger.error("Module " + uri[1] + "/ Version does not match/ Version of the module = " + module.version);
            return;

        }
        else {
            logger.log("Module " + uri[1] + "/ Version match");

        }

        if (!checkModuleType(uri[1], module.type)) {

            let stateModuleTypeKey = ModuleType[module.type];

            res.status(400).send("The moduletype does not match/ Moduletype = " + stateModuleTypeKey);
            return;
        }
        else {
            logger.log("Module " + uri[1] + "/ Moduletype match");
        }

        res.send(module.getState());
        logger.log("Sent module " + uri[1] + "state");

    }
});

router.put('/Mazes/:version/:slot', (req, res) => {

    if (process.env.apiDummyMode === "true") {

        //For dummy-mode   
        const uri = req.path.split('/');

        mazes.wallMatrix = req.body.wallMatrix;
        mazes.special = req.body.special;
        mazes.statusLed = req.body.statusLed;

        res.send(mazes);
        logger.log("Modify " + uri[1] + "dummy data");

    }
    else {

        const validateParameterResult = validateParameterTuple(req.params);
        const module = moduleAt(parseInt(req.params.slot));
        const uri = req.path.split('/');


        if (validateParameterResult.error) {
            res.status(400).send(validateParameterResult.error);
            logger.error(uri[1] + " uri parameter/ " + validateParameterResult.error);

            return;
        }

        if (module === null) {

            res.status(400).send("No module connected at slot: " + req.params.slot);
            logger.error("No module connected at slot: " + req.params.slot);

            return;
        }
        else {
            logger.log("Module " + uri[1] + "detected at slot: " + req.params.slot);
        }

        if (module.version !== parseInt(req.params.version)) {

            res.status(400).send("The version does not match/ Version of the module = " + module.version);
            logger.error("Module " + uri[1] + "/ Version does not match/ Version of the module = " + module.version);
            return;

        }
        else {
            logger.log("Module " + uri[1] + "/ Version match");
        }

        if (!checkModuleType(uri[1], module.type)) {

            let stateModuleTypeKey = ModuleType[module.type];

            res.status(400).send("The moduletype does not match/ Moduletype = " + stateModuleTypeKey);
            logger.error("Module " + uri[1] + "/ Moduletype does not match/ Moduletype = " + stateModuleTypeKey);

            return;
        }
        else {
            logger.log("Module " + uri[1] + "/ Moduletype match");
        }

        module.setTarget(req.body);

        res.send(module.getState());
        logger.log("Module " + uri[1] + "/ Target set successfully");

    }


});


export default router;
