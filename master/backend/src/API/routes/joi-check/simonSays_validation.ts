import Joi, { bool, boolean } from 'joi';

export const validateSimonSays = (simonSays: { red_led: boolean, blue_led: boolean, green_led: boolean, yellow_led: boolean }) => {

    const simonSaysSchema = Joi.object({

        red_led: Joi.boolean().required(),
        blue_led: Joi.boolean().required(),
        green_led: Joi.boolean().required(),
        yellow_led: Joi.boolean().required(),


    });
    return simonSaysSchema.validate(simonSays);
};