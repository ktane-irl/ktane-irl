import Joi from 'joi';

export const validateStatusLed = (statusLed: { red_led: boolean, green_led: boolean }) => {

    const simonSaysSchema = Joi.object({

        red_led: Joi.boolean().required(),
        green_led: Joi.boolean().required()

    });
    return simonSaysSchema.validate(statusLed);
};