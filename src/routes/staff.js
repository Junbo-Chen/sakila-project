const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { requireAuth, requireRole } = require('../middleware/auth');


router.use(requireAuth);
router.use(requireRole(['staff', 'admin']));

router.get('/dashboard', staffController.dashboard);

router.get('/rentals', staffController.getRentals);
router.get('/rentalCreate', staffController.newRentalForm);
router.post('/rentals/create', staffController.createRental);
router.post('/rentals/:id/return', staffController.returnRental);

// router.get('/customers', staffController.getCustomers);
// router.get('/customers/search', staffController.searchCustomers);
// router.get('/customers/:id', staffController.getCustomerDetails);
// router.post('/customers/create', staffController.createCustomer);

// router.get('/inventory', staffController.getInventory);
// router.get('/films/search', staffController.searchFilms);

// router.get('/payments', staffController.getPayments);
// router.post('/payments/create', staffController.createPayment);

module.exports = router;