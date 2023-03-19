import Joi from 'joi';

//For dummy-mode

/*
export const validateCase = (cases: { indicator_id_ref_led: Array<boolean>, indicator_id_batt_ref: Array<boolean> }) => {

    const caseSchema = Joi.object({
        indicator_id_ref_led: Joi.array().items(Joi.boolean().required()).min(5).max(5).required()
    });
    return caseSchema.validate(cases);
};

*/


export const validateCase = (cases: { indicatorLed: Array<boolean> }) => {

    const caseSchema = Joi.object({
        indicatorLed: Joi.array().items(Joi.boolean().required()).min(5).max(5).required()
    });
    return caseSchema.validate(cases);
};