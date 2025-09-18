const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

// Apply authentication and role-based access
router.use(requireAuth);
router.use(requireRole(['customer']));

// Dashboard
router.get('/dashboard', customerController.dashboard);

module.exports = router;