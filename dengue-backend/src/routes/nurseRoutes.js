const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Protect all nurse routes
router.use(verifyToken, requireRole(['nurse']));

// Get assigned wards for dashboard
router.get('/wards', nurseController.getAssignedWards);

module.exports = router;
