const Joi = require('joi');

const createAdminSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required()
});

const createHospitalSchema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    telephone: Joi.string().required(),
    email: Joi.string().email().required(),
    username: Joi.string().required(),
    password: Joi.string().min(6).required()
});


const updateHospitalSchema = Joi.object({
    name: Joi.string(),
    address: Joi.string(),
    telephone: Joi.string(),
    email: Joi.string().email()
});

const updateStaffSchema = Joi.object({
    name: Joi.string(),
    telephone: Joi.string(),
    address: Joi.string(),
    email: Joi.string().email()
});

const updateAdminSchema = Joi.object({
    username: Joi.string()
});

module.exports = {
    createAdminSchema,
    createHospitalSchema,
    updateHospitalSchema,
    updateStaffSchema,
    updateAdminSchema
};
