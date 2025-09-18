const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

// Apply authentication and role-based access
router.use(requireAuth);
router.use(requireRole(['staff', 'admin']));

// Dashboard
router.get('/dashboard', staffController.dashboard);

// Rentals Management
router.get('/rentals', staffController.getRentals);
router.get('/rentalCreate', staffController.newRentalForm);
router.post('/rentals/create', staffController.createRental);
router.post('/rentals/:id/return', staffController.returnRental);

// Customers Management
router.get('/customers', staffController.getCustomers);
router.get('/customers/search', staffController.searchCustomers);
router.get('/customer/:id', staffController.getCustomerDetails);
router.post('/customers/create', staffController.createCustomer);
router.get('/customer/:id/edit', staffController.getCustomerEditForm);
router.post('/customer/:id/edit', staffController.updateCustomer);


module.exports = router;