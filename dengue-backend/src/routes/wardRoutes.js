const express = require('express');
const router = express.Router();
const wardController = require('../controllers/wardController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { assignDoctorSchema, assignNurseSchema, createPatientSchema, toggleCriticalSchema } = require('../validators/wardValidator');

// ALL routes here require the 'wordmain' (Ward Admin) role
router.use(verifyToken);
router.use(requireRole(['wordmain']));

// Endpoints for Ward Admin assigning staff to their ward
router.post('/assign-doctor', validate(assignDoctorSchema), wardController.assignDoctor);
router.post('/assign-nurse', validate(assignNurseSchema), wardController.assignNurse);

// Endpoint for Ward Admin creating and assigning a patient to a bed
router.post('/patients', validate(createPatientSchema), wardController.createPatient);
router.put('/patients/:patient_id/discharge', wardController.dischargePatient);

// Endpoint for toggling critical state
router.put('/patients/:bed_no/critical', validate(toggleCriticalSchema), wardController.toggleCriticalPatient);

router.get('/my-ward', wardController.getWardDetails);
router.get('/my-patients', wardController.getWardPatients);

router.get('/doctors', wardController.getHospitalDoctors);
router.get('/nurses', wardController.getHospitalNurses);

module.exports = router;
