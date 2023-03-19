import Joi from "joi";

export const validateParameter = (params: { version: string }) => {

    const parameterSchema = Joi.object({
        version: Joi.number().min(1)

    });
    return parameterSchema.validate(params);
};


export const validateParameterTuple = (params: { version: string, slot: string }) => {

    const parameterSchema = Joi.object({
        version: Joi.number().min(1),
        slot: Joi.number().integer().min(0).max(11)

    });
    return parameterSchema.validate(params);
};





