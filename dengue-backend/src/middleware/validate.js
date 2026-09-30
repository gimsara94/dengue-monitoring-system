// Universal Validation Middleware
const validate = (schema) => {
    return (req, res, next) => {
        // We validate the request body against the provided Joi schema
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors, not just the first one
            allowUnknown: true, // Allow unknown keys that will be ignored
            stripUnknown: true // Remove unknown keys from the validated object
        });

        if (error) {
            // Map the Joi error details to a cleaner array of messages
            const errorMessages = error.details.map((detail) => detail.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errorMessages
            });
        }

        // Replace req.body with the sanitized, validated value
        req.body = value;
        next();
    };
};

module.exports = validate;
