import express from "express";
import { validateParameterTuple } from "./joi-check/uri_parameter";
import { moduleAt } from "../../moduleController";
import { checkModuleType } from "../../helper";
import { ModuleType } from "../../../../common/types/module";
import { Wi01 } from "../../modules/questModules/02-wires/wi01";
import { WiresConfiguration } from "../../../../common/types/modules/questModules/wires";
import { ConsoleLogger } from "../../logger";

export const router = express.Router();
export const logger = new ConsoleLogger("ApiLogger");

export const testWiresState = {

    statusLed: {
        red: false,
        green: true
    },
    wiresColor: [1, 2, 4, 5, 6, 2]

}


router.get('/play/config/Wires/:version/:slot', (req, res) => {

    const testConfigWires: any = {};

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

            let wiresObject = new Wi01(1);
            let wiresConfiguration: WiresConfiguration = wiresObject.configGenerate();
            testConfigWires["wiresTarget"] = wiresConfiguration;
            testConfigWires["wiresState"] = testWiresState;
            res.send(testConfigWires);
            logger.log("Play config dummy data created for the " + uri[3] + " module");

        }
        else {
            res.status(400).send("Wires configuration with the given version and slot was not found");
            logger.error("Error while creating dummy data for the play config " + uri[3]);
        }


    } else {

        const validateParameterResult = validateParameterTuple(req.params);
        const module = moduleAt(parseInt(req.params.slot));
        const uri = req.path.split('/');
        const configWires: any = {};

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

        configWires["wiresTarget"] = module.getTarget();
        configWires["wiresState"] = module.getState();

        res.send(configWires);
        logger.log("Play config created for module" + uri[3]);

    }

});






export default router;