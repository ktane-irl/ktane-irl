import Joi from 'joi';

export const validateClock = (clock: { time_minute: number, time_sec: number, strike_1: boolean, strike_2: boolean }) => {

    const clockSchema = Joi.object({

        time_minute: Joi.number().integer().min(0).max(60).required(),
        time_sec: Joi.number().integer().min(0).max(59).required(),
        strike_1: Joi.boolean().required(),
        strike_2: Joi.boolean().required()
    });
    return clockSchema.validate(clock);
};