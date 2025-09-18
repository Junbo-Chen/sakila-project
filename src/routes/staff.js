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

// Inventory Management
router.get('/inventory', staffController.getInventory);
router.get('/inventory/search', staffController.searchInventory);
router.post('/inventory/add', staffController.addInventory);

router.get('/films/search', staffController.searchFilms);

router.post('/films/add', staffController.addFilm);
router.post('/films/:id/add-copy', staffController.addFilmCopy);
router.post('/films/:id/remove-copy', staffController.removeFilmCopy);
router.put('/films/:id', staffController.updateFilm);

// Bulk operations for inventory
router.post('/inventory/bulk-add-copies', staffController.bulkAddCopies);
router.post('/inventory/bulk-update-rates', staffController.bulkUpdateRates);

module.exports = router;