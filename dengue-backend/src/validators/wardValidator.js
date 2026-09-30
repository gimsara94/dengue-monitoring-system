const Joi = require('joi');

const assignStaffSchema = Joi.object({
    doctor_id: Joi.number().integer().positive(),
    nurse_id: Joi.number().integer().positive()
}).or('doctor_id', 'nurse_id'); // must provide at least one, but endpoints split this conceptually anyway. We'll use this generically or specific ones below.

const assignDoctorSchema = Joi.object({
    doctor_id: Joi.number().integer().positive().required()
});

const assignNurseSchema = Joi.object({
    nurse_id: Joi.number().integer().positive().required()
});

const createPatientSchema = Joi.object({
    name: Joi.string().required(),
    b_day: Joi.date().iso().required(),
    nic: Joi.string().allow('', null),
    telephone: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    bed_no: Joi.number().integer().positive().required()
});

const toggleCriticalSchema = Joi.object({
    is_critical: Joi.boolean().required()
});

module.exports = {
    assignDoctorSchema,
    assignNurseSchema,
    createPatientSchema,
    toggleCriticalSchema
};
