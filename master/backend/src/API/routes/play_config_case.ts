import express from "express";
import { validateParameterTuple } from "./joi-check/uri_parameter";
import { moduleAt } from "../../moduleController";
import { checkModuleType } from "../../helper";
import { ModuleType } from "../../../../common/types/module";
import { Ca01 } from "../../modules/00-case/ca01";
import { CaseConfiguration } from "../../../../common/types/modules/case";
import { ConsoleLogger } from "../../logger";

export const router = express.Router();
export const logger = new ConsoleLogger("ApiLogger");

export const testCaseState = {

    serialNumber: "AL5OF2",
    indicatorText: ["SND", "CLR", "CAR", "SIG", "SIG"],
    indicatorLed: [true, false, true, false, false],
    batteries: [true, false, false, false, false, false],
    ports: {
        "DVI-D": false,
        "Parallel": true,
        "PS/2": false,
        "RJ-45": false,
        "Serial": false,
        "Cinch": false,
    }
}


router.get('/play/config/Case/:version/:slot', (req, res) => {

    const testConfigCase: any = {};

    if (process.env.apiDummyMode === "true") {
        // For dummy-mode
        const uri = req.path.split('/');

        const validateParameterResult = validateParameterTuple(req.params);

        if (validateParameterResult.error) {
            res.status(400).send(validateParameterResult.error);
            logger.error("Play config " + uri[3] + " uri parameter/ " + validateParameterResult.error);
            return;
        }

        if (req.params.version === "1") {

            let caseObject = new Ca01(1);
            let caseConfiguration: CaseConfiguration = caseObject.configGenerate();
            testConfigCase["caseTarget"] = caseConfiguration;
            testConfigCase["caseState"] = testCaseState;

            res.send(testConfigCase);
            logger.log("Play config dummy data created for the " + uri[3] + " module");

        }
        else {
            res.status(400).send("Case configuration with the given version and slot was not found");
            logger.error("Error while creating dummy data for the play config " + uri[3]);
        }

    }
    else {

        const validateParameterResult = validateParameterTuple(req.params);
        const module = moduleAt(parseInt(req.params.slot));
        const uri = req.path.split('/');
        const configCase: any = {};

        if (validateParameterResult.error) {
            res.status(400).send(validateParameterResult.error);
            logger.error("Play config " + uri[3] + "uri parameter/ " + validateParameterResult.error);
            return;
        }

        if (module === null) {
            res.status(400).send("No module connected at slot: " + req.params.slot);
            logger.error("No module connected at slot: " + req.params.slot);
            return;
        }
        else {
            logger.log("Module " + uri[3] + "detected at slot: " + req.params.slot);

        }

        if (module.version !== parseInt(req.params.version)) {

            res.status(400).send("The version does not match/ Version of the module = " + module.version);
            logger.error("Play config " + uri[3] + "/ Version does not match/ Version of the module = " + module.version);
            return;

        }
        else {
            logger.log("Play config " + uri[3] + "/ Version match");
        }

        if (!checkModuleType(uri[3], module.type)) {

            let stateModuleTypeKey = ModuleType[module.type];

            res.status(400).send("The moduletype does not match/ Moduletype = " + stateModuleTypeKey);
            logger.error("Play config" + uri[3] + "/ Moduletype does not match/ Moduletype = " + stateModuleTypeKey)
            return;
        }
        else {
            logger.log("Play config" + uri[3] + "/ Moduletype match");
        }

        configCase["caseTarget"] = module.getTarget();
        configCase["caseState"] = module.getState();

        res.send(configCase);
        logger.log("Play config created for module" + uri[3]);

    }

});

export default router; 