const Joi = require('joi');

const loginSchema = Joi.object({
    username: Joi.string().required().messages({
        'string.empty': 'Username cannot be empty',
        'any.required': 'Username is required'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password cannot be empty',
        'any.required': 'Password is required'
    })
});

module.exports = {
    loginSchema
};
