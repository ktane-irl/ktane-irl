import express, { } from "express";
import { validateParameterTuple } from "./joi-check/uri_parameter";
import { moduleAt } from "../../moduleController";
import { checkModuleType } from "../../helper";
import { ModuleType } from "../../../../common/types/module";
import { ConsoleLogger } from "../../logger";



export const router = express.Router();
export const logger = new ConsoleLogger("ApiLogger");

export const wires = {

    wiresColor: [0, 1, 2, 4, 5, 6],
    statusLed: {
        red: true,
        green: false
    }
}


router.get('/Wires/:version/:slot', (req, res) => {

    if (process.env.apiDummyMode === "true") {
        //For dummy-mode
        const uri = req.path.split('/');

        res.send(wires);
        logger.log("Create dummy data for module " + uri[1]);


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
            logger.error("Module " + uri[1] + "/ Moduletype does not match/ Moduletype = " + stateModuleTypeKey);
            return;
        }
        else {
            logger.log("Module " + uri[1] + "/ Moduletype match");
        }

        res.send(module.getState());
        logger.log("Sent module " + uri[1] + "state");

    }



});

router.put('/Wires/:version/:slot', (req, res) => {

    if (process.env.apiDummyMode === "true") {

        //For dummy-mode
        const uri = req.path.split('/');

        wires.statusLed = req.body.statusLed;
        res.send(wires);
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