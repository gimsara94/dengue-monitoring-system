const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { loginSchema } = require('../validators/authValidator');

// Public route for all users (Admin, Ward, Doctor, Nurse)
router.post('/login', validate(loginSchema), authController.login);
router.post('/setup-admin', authController.setupInitialAdmin); // Remove or protect this later!

module.exports = router;
