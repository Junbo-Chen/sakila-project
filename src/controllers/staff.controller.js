const staffService = require('../services/staff.service');
const { logger } = require('../util/logger');

const staffController = {
  dashboard: (req, res) => {
    const staffId = req.session.user.staff_id || 1;
    
    staffService.getDashboardData(staffId, (err, data) => {
      if (err) {
        logger.error(`Staff dashboard error: ${err.message}`);
        return res.render('error', {
          title: 'Dashboard Error',
          message: 'Kon dashboard gegevens niet laden',
          error: err
        });
      }
      
      res.render('staff/dashboard', {
        title: 'Staff Dashboard',
        user: req.session.user,
        dashboardData: data
      });
    });
  },

  getRentals: (req, res) => {
    const staffId = req.session.user.staff_id || 1;
    
    staffService.getActiveRentals(staffId, (err, rentals) => {
      if (err) {
        return res.render('error', { 
          title: 'Rentals Error', 
          message: err.message,
          error: err 
        });
      }
      
      res.render('staff/rentals', {
        title: 'Actieve Verhuur',
        rentals: rentals
      });
    });
  },

  newRentalForm: (req, res) => {
    staffService.getAvailableFilms((err, films) => {
      if (err) {
        return res.render('error', { 
          title: 'Films Error', 
          message: err.message,
          error: err 
        });
      }
      
      res.render('staff/new-rental', {
        title: 'Nieuwe Verhuur',
        films: films
      });
    });
  },

  createRental: (req, res) => {
    const { customer_id, inventory_id } = req.body;
    const staff_id = req.session.user.staff_id || 1;
    
    staffService.createRental(customer_id, inventory_id, staff_id, (err, rental) => {
      if (err) {
        logger.error(`Create rental error: ${err.message}`);
        return res.render('staff/new-rental', {
          title: 'Nieuwe Verhuur',
          error: 'Kon verhuur niet aanmaken: ' + err.message
        });
      }
      
      res.redirect('/staff/rentals');
    });
  },

  returnRental: (req, res) => {
    const rentalId = req.params.id;
    const staff_id = req.session.user.staff_id || 1;
    
    staffService.returnRental(rentalId, staff_id, (err, result) => {
      if (err) {
        logger.error(`Return rental error: ${err.message}`);
        return res.json({ success: false, error: err.message });
      }
      
      res.json({ success: true });
    });
  },

  getCustomers: (req, res) => {
    staffService.getCustomers((err, customers) => {
      if (err) {
        return res.render('error', { 
          title: 'Customers Error', 
          message: err.message,
          error: err 
        });
      }
      
      res.render('staff/customers', {
        title: 'Klanten Beheer',
        customers: customers
      });
    });
  },

  searchCustomers: (req, res) => {
    const { q } = req.query;
    
    staffService.searchCustomers(q, (err, customers) => {
      if (err) {
        return res.json({ error: err.message });
      }
      
      res.json({ customers: customers });
    });
  },

  getCustomerDetails: (req, res) => {
    const customerId = req.params.id;
    
    staffService.getCustomerDetails(customerId, (err, customer) => {
      if (err) {
        return res.render('error', { 
          title: 'Customer Error', 
          message: err.message,
          error: err 
        });
      }
      
      res.render('staff/customer-detail', {
        title: 'Klant Details',
        customer: customer
      });
    });
  },

  getInventory: (req, res) => {
    staffService.getInventory((err, inventory) => {
      if (err) {
        return res.render('error', { 
          title: 'Inventory Error', 
          message: err.message,
          error: err 
        });
      }
      
      res.render('staff/inventory', {
        title: 'Film Inventory',
        inventory: inventory
      });
    });
  },

  searchFilms: (req, res) => {
    const { q } = req.query;
    
    staffService.searchFilms(q, (err, films) => {
      if (err) {
        return res.json({ error: err.message });
      }
      
      res.json({ films: films });
    });
  },

  getPayments: (req, res) => {
    const staffId = req.session.user.staff_id || 1;
    
    staffService.getRecentPayments(staffId, (err, payments) => {
      if (err) {
        return res.render('error', { 
          title: 'Payments Error', 
          message: err.message,
          error: err 
        });
      }
      
      res.render('staff/payments', {
        title: 'Recente Betalingen',
        payments: payments
      });
    });
  }
};

module.exports = staffController;