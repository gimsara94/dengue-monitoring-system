const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createAdminSchema, createHospitalSchema, updateHospitalSchema, updateStaffSchema, updateAdminSchema } = require('../validators/adminValidator');

// ALL routes here require the 'super_admin' or 'general_admin' role
router.use(verifyToken);
router.use(requireRole(['admin']));

// Dashboard Stats
router.get('/dashboard-stats', adminController.getDashboardStats);

// Endpoint to create another admin (Super Admin only can create super admins, but both can create general_admins - logic in controller)
router.post('/admin', validate(createAdminSchema), adminController.createAdmin);
router.get('/admins', adminController.getAdmins);
router.put('/admins/:id', validate(updateAdminSchema), adminController.updateAdmin);
router.delete('/admins/:id', adminController.deleteAdmin);

// Endpoints to manage topology
router.post('/hospital', validate(createHospitalSchema), adminController.createHospital);
router.get('/hospitals', adminController.getHospitals);
router.put('/hospitals/:id', validate(updateHospitalSchema), adminController.updateHospital);
router.delete('/hospitals/:id', adminController.deleteHospital);

// Endpoints for Admin to globally view/manage staff (Creation moved to Hospital Admin)
router.get('/doctors', adminController.getDoctors);
router.put('/doctors/:id', validate(updateStaffSchema), adminController.updateDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);

router.get('/nurses', adminController.getNurses);
router.put('/nurses/:id', validate(updateStaffSchema), adminController.updateNurse);
router.delete('/nurses/:id', adminController.deleteNurse);

module.exports = router;
