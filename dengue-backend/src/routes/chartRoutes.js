const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chartController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { vitalsSchema, labsSchema, observationsSchema, volumesSchema, urineSchema } = require('../validators/chartValidator');

// === WARD ROUTES ===
// Wordmain implicitly posts to their own hospital/ward
router.post('/ward/vitals/:bed_no', verifyToken, requireRole(['wordmain']), validate(vitalsSchema), chartController.addWardVitals);
router.post('/ward/labs/:bed_no', verifyToken, requireRole(['wordmain']), validate(labsSchema), chartController.addWardLabs);
router.post('/ward/observations/:bed_no', verifyToken, requireRole(['wordmain']), validate(observationsSchema), chartController.addWardObservations);
router.post('/ward/volumes/:bed_no', verifyToken, requireRole(['wordmain']), validate(volumesSchema), chartController.addWardVolumes);
router.post('/ward/urine/:bed_no', verifyToken, requireRole(['wordmain']), validate(urineSchema), chartController.addWardUrine);
// Read charts by date (bed_no in URL, date as query parameter ?date=YYYY-MM-DD)
router.get('/ward/:bed_no', verifyToken, requireRole(['wordmain']), chartController.getWardPatientCharts);

// === STAFF ROUTES ===
// Doctors & Nurses MUST specify the hospital & ward in the URL
router.post('/staff/:hospital_id/:ward_id/vitals/:bed_no', verifyToken, requireRole(['doctor', 'nurse']), validate(vitalsSchema), chartController.addStaffVitals);
router.post('/staff/:hospital_id/:ward_id/labs/:bed_no', verifyToken, requireRole(['doctor', 'nurse']), validate(labsSchema), chartController.addStaffLabs);
router.post('/staff/:hospital_id/:ward_id/observations/:bed_no', verifyToken, requireRole(['doctor', 'nurse']), validate(observationsSchema), chartController.addStaffObservations);
router.post('/staff/:hospital_id/:ward_id/volumes/:bed_no', verifyToken, requireRole(['doctor', 'nurse']), validate(volumesSchema), chartController.addStaffVolumes);
router.post('/staff/:hospital_id/:ward_id/urine/:bed_no', verifyToken, requireRole(['doctor', 'nurse']), validate(urineSchema), chartController.addStaffUrine);
// Read charts by date (hospital, ward, bed in URL, date as query parameter ?date=YYYY-MM-DD)
router.get('/staff/:hospital_id/:ward_id/:bed_no', verifyToken, requireRole(['doctor', 'nurse']), chartController.getStaffPatientCharts);


module.exports = router;
