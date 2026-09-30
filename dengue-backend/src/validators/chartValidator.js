const Joi = require('joi');

// We use Joi specifically to ensure variables are of correct types and within broadly logical medical ranges, without being over-restrictive.
const vitalsSchema = Joi.object({
    chart_date: Joi.date().iso().optional(),
    chart_time: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d):?([0-5]\d)$/).optional(), // HH:MM:SS
    pr_min: Joi.number().integer().min(0).max(300).optional(),
    bp_supine_sys: Joi.number().integer().min(0).max(300).optional(),
    bp_supine_dia: Joi.number().integer().min(0).max(200).optional(),
    pulse_pressure: Joi.number().integer().min(0).max(200).optional(),
    bp_sitting_sys: Joi.number().integer().min(0).max(300).optional(),
    bp_sitting_dia: Joi.number().integer().min(0).max(200).optional(),
    crft: Joi.string().max(255).optional(),
    rr_min: Joi.number().integer().min(0).max(100).optional()
}).min(1); // Ensure at least one field is provided besides chart_date/chart_time

const labsSchema = Joi.object({
    chart_date: Joi.date().iso().optional(),
    chart_time: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d):?([0-5]\d)$/).optional(),
    pcv_percentage: Joi.number().min(0).max(100).optional(),
    plt_count: Joi.number().integer().min(0).optional(),
    wbc_total: Joi.number().min(0).optional()
}).min(1);

const observationsSchema = Joi.object({
    chart_date: Joi.date().iso().optional(),
    chart_time: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d):?([0-5]\d)$/).optional(),
    observation_text: Joi.string().required()
});

const volumesSchema = Joi.object({
    chart_date: Joi.date().iso().optional(),
    chart_time: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d):?([0-5]\d)$/).optional(),
    oral_ml: Joi.number().integer().min(0).optional(),
    n_saline_ml: Joi.number().integer().min(0).optional(),
    dextran_40_ml: Joi.number().integer().min(0).optional(),
    tetrastarch_ml: Joi.number().integer().min(0).optional(),
    blood_ml: Joi.number().integer().min(0).optional(),
    other_ml: Joi.number().integer().min(0).optional()
}).min(1);

module.exports = {
    vitalsSchema,
    labsSchema,
    observationsSchema,
    volumesSchema
};

const urineSchema = Joi.object({
    chart_date: Joi.date().iso().optional(),
    chart_time: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d):?([0-5]\d)$/).optional(),
    urine_ml: Joi.number().integer().min(0).required(),
    hour: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).required() // HH:MM
});

module.exports = {
    vitalsSchema,
    labsSchema,
    observationsSchema,
    volumesSchema,
    urineSchema
};
