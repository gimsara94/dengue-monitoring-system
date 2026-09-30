const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(requireRole(['doctor']));

router.get('/wards', doctorController.getAssignedWards);

module.exports = router;
