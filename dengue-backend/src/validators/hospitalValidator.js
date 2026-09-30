const Joi = require('joi');

const createHospitalStaffSchema = Joi.object({
    name: Joi.string().required(),
    telephone: Joi.string().required(),
    nic_no: Joi.string().required(),
    address: Joi.string().required(),
    email: Joi.string().email().required(),
    username: Joi.string().required(),
    password: Joi.string().min(6).required()
});

const updateHospitalStaffSchema = Joi.object({
    name: Joi.string(),
    telephone: Joi.string(),
    address: Joi.string(),
    email: Joi.string().email()
});

const createHospitalWardSchema = Joi.object({
    ward_id: Joi.number().integer().positive().required(),
    beds: Joi.number().integer().min(0).required(),
    username: Joi.string().required(),
    password: Joi.string().min(6).required()
});

module.exports = {
    createHospitalStaffSchema,
    updateHospitalStaffSchema,
    createHospitalWardSchema
};
