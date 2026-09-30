const express = require('express');
const router = express.Router();
const hospitalAdminController = require('../controllers/hospitalAdminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createHospitalStaffSchema, updateHospitalStaffSchema, createHospitalWardSchema } = require('../validators/hospitalValidator');

// ALL routes here require the 'hospital' role
router.use(verifyToken);
router.use(requireRole(['hospital']));

// Dashboard Stats
router.get('/dashboard-stats', hospitalAdminController.getDashboardStats);

// Endpoints to manage wards for this hospital
router.post('/wards', validate(createHospitalWardSchema), hospitalAdminController.createWard);

// Endpoints to manage doctors for this hospital
router.post('/doctors', validate(createHospitalStaffSchema), hospitalAdminController.createDoctor);
router.get('/doctors', hospitalAdminController.getDoctors);
router.put('/doctors/:id', validate(updateHospitalStaffSchema), hospitalAdminController.updateDoctor);
router.delete('/doctors/:id', hospitalAdminController.deleteDoctor);

// Endpoints to manage nurses for this hospital
router.post('/nurses', validate(createHospitalStaffSchema), hospitalAdminController.createNurse);
router.get('/nurses', hospitalAdminController.getNurses);
router.put('/nurses/:id', validate(updateHospitalStaffSchema), hospitalAdminController.updateNurse);
router.delete('/nurses/:id', hospitalAdminController.deleteNurse);

module.exports = router;
