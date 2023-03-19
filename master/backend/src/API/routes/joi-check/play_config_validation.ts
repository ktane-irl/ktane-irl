import Joi from "joi";


export const validateAvailableModules = (construction_kit: {
    available_modules: [name: string, v1: number],
    count_of_wished_modules: number, severity_level: number, minutes_to_play: number
}) => {

    const availableModulSchema = Joi.object({
        available_modules: Joi.array().min(14).max(14).required(),
        count_of_wished_modules: Joi.number().integer().required().min(2).max(11).required(),
        severity_level: Joi.number().integer().min(1).max(6).required(),
        seconds_to_play: Joi.number().integer().min(0).required()
    });
    return availableModulSchema.validate(construction_kit);
};