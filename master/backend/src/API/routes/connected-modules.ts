import express, { } from "express";
import { ModuleType } from "../../../../common/types/module";
import { ConsoleLogger } from "../../logger";
import { getModules } from "../../moduleController";
export const router = express.Router();

export const logger = new ConsoleLogger("ApiLogger");

export const connected_modules = {
    "slot_0": {
        "name": "Case",
        "version": 1,
        "configuration_target_reached": true
    },
    "slot_1": {
        "name": "ClockModule",
        "version": 1,
        "configuration_target_reached": true
    },
    "slot_2": {
        "name": "Wires",
        "version": 1,
        "configuration_target_reached": false
    },
    "slot_3": {
        "name": "SimonSays",
        "version": 1,
        "configuration_target_reached": true
    },
    "slot_4": {
        "name": "Mazes",
        "version": 1,
        "configuration_target_reached": true
    },
    "slot_5": {
        "name": "TheButton",
        "version": 1,
        "configuration_target_reached": false

    },
    "slot_6": {
        "name": "not_connected",
        "version": 0,
        "configuration_target_reached": false

    },
    "slot_7": {
        "name": "not_connected",
        "version": 1,
        "configuration_target_reached": false
    },
    "slot_8": {
        "name": "not_connected",
        "version": 0,
        "configuration_target_reached": false,

    },
    "slot_9": {
        "name": "not_connected",
        "version": 0,
        "configuration_target_reached": false

    },
    "slot_10": {
        "name": "not_connected",
        "version": 0,
        "configuration_target_reached": false

    },
    "slot_11": {
        "name": "not_connected",
        "version": 1,
        "configuration_target_reached": false
    },
    "slot_12": {
        "name": "not_connected",
        "version": 1,
        "configuration_target_reached": false
    }
}

// Get the list of all connected modules
router.get('/connected-modules', (req, res) => {

    if (process.env.apiDummyMode === "true") {
        //For dummy-mode
        const uri = req.path.split('/');

        res.send(connected_modules);
        logger.log(" Create dummy data for " + uri[1]);


    }
    else {

        const uri = req.path.split('/');
        const out: any = {};
        const modules = getModules();

        for (let pos = 0; pos < modules.length; pos++) {
            let module = modules[pos];

            if (module !== null) {
                out["slot_" + pos] = {
                    name: ModuleType[module.type],
                    version: module.version,
                    configuration_target_reached: !module.isDirty()
                }
            }
            else {
                out["slot_" + pos] = {
                    name: "not_connected",
                    version: 0
                }
            }

        }

        res.send(out);
        logger.log("Sent " + uri[1]);

    }

});

export default router;