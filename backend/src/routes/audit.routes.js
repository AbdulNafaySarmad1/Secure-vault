const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// User can view own logs
router.get('/my-logs', auditController.getMyLogs);

// Admin can view all logs
router.get('/all', authorize('admin'), auditController.getAllLogs);

module.exports = router;
