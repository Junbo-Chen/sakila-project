const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

// Middleware: alleen staff en admin kunnen hier komen
router.use(requireAuth);
router.use(requireRole(['staff', 'admin']));

// Staff dashboard
router.get('/dashboard', staffController.dashboard);

// Verhuur beheer
router.get('/rentals', staffController.getRentals);
router.get('/rentals/new', staffController.newRentalForm);
router.post('/rentals/create', staffController.createRental);
router.post('/rentals/:id/return', staffController.returnRental);

// Klant beheer
router.get('/customers', staffController.getCustomers);
router.get('/customers/search', staffController.searchCustomers);
router.get('/customers/:id', staffController.getCustomerDetails);
router.post('/customers/create', staffController.createCustomer);

// Film inventory
router.get('/inventory', staffController.getInventory);
router.get('/films/search', staffController.searchFilms);

// Betalingen
router.get('/payments', staffController.getPayments);
router.post('/payments/create', staffController.createPayment);

module.exports = router;