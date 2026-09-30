const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { toggleCriticalSchema } = require('../validators/wardValidator');
const validate = require('../middleware/validate');

// Protect routes: only doctors and nurses can access these
router.use(verifyToken, requireRole(['doctor', 'nurse']));

// Get their assigned wards
router.get('/wards', verifyToken, requireRole(['doctor', 'nurse']), staffController.getAssignedWards);

// Get ward info
router.get('/:hospital_id/:ward_id/info', verifyToken, requireRole(['doctor', 'nurse']), staffController.getWardInfo);

// Get list of currently active patients in a specific ward
router.get('/:hospital_id/:ward_id/patients', verifyToken, requireRole(['doctor', 'nurse']), staffController.getWardPatients);

// Toggle patient critical state (resolving bed_no dynamically)
router.put('/:hospital_id/:ward_id/patients/:bed_no/critical', verifyToken, requireRole(['doctor']), validate(toggleCriticalSchema), staffController.toggleCriticalPatient);

// Discharge a patient (Doctors only)
router.put('/:hospital_id/:ward_id/patients/:bed_no/discharge', verifyToken, requireRole(['doctor']), staffController.dischargePatient);

module.exports = router;
