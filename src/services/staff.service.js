const { create } = require('../dao/actor.dao');
const staffDAO = require('../dao/staff.dao');
const { logger } = require('../util/logger');

const staffService = {
  getDashboardData: (staffId, callback) => {
    logger.info(`Getting dashboard data for staff ID: ${staffId}`);
    staffDAO.getDashboardStats(staffId, callback);
  },

  getActiveRentals: (staffId, page, callback) => {
    logger.info(`Getting active rentals for staff ID: ${staffId}, page: ${page}`);
    staffDAO.getActiveRentals(staffId, page, callback);
  },

  getAvailableFilms: (page, callback) => {
    logger.info(`Getting available films for rental - page: ${page}`);
    staffDAO.getAvailableFilms(page, callback);
  },

  getAvailableFilmsWithFilter: (page, searchQuery, categoryFilter, callback) => {
    logger.info(`Getting available films with filters - page: ${page}, search: "${searchQuery}", category: "${categoryFilter}"`);
    staffDAO.getAvailableFilmsWithFilter(page, searchQuery, categoryFilter, callback);
  },

  createRental: (customerId, inventoryId, staffId, callback) => {
    logger.info(`Creating rental: customer ${customerId}, inventory ${inventoryId}, staff ${staffId}`);

    if (!customerId || !inventoryId || !staffId) {
      return callback(new Error('Alle velden zijn verplicht'));
    }
    
    staffDAO.createRental(customerId, inventoryId, staffId, callback);
  },

  returnRental: (rentalId, staffId, callback) => {
    logger.info(`Returning rental ${rentalId} by staff ${staffId}`);
    staffDAO.returnRental(rentalId, callback);
  },

  getCustomers: (callback) => {
    logger.info('Getting all customers');
    staffDAO.getCustomers(callback);
  },

  searchCustomers: (searchTerm, callback) => {
    logger.info(`Searching customers with term: ${searchTerm}`);
    if (!searchTerm || searchTerm.trim() === '') {
      return callback(null, []);
    }
    staffDAO.searchCustomers(searchTerm, callback);
  },
  
  createCustomer: (customerData, callback) => {
    logger.info('Creating new customer');
    if (!customerData.first_name || !customerData.last_name || !customerData.email || !customerData.address) {
      return callback(new Error('Alle velden zijn verplicht'));
    }
    staffDAO.createCustomer(customerData, callback);
  },

  getCustomerDetails: (customerId, callback) => {
    logger.info(`Getting details for customer ID: ${customerId}`);
    staffDAO.getCustomerDetails(customerId, callback);
  },

  searchFilms: (searchTerm, callback) => {
    logger.info(`Searching films with term: ${searchTerm}`);
    if (!searchTerm || searchTerm.trim() === '') {
      return callback(null, []);
    }
    staffDAO.searchFilms(searchTerm, callback);
  },

  getRecentPayments: (staffId, callback) => {
    logger.info(`Getting recent payments for staff ID: ${staffId}`);
    staffDAO.getRecentPayments(staffId, callback);
  },
  updateCustomer: (customerId, customerData, callback) => {
    staffDAO.updateCustomer(customerId, customerData, (err, result) => {
      if (err) {
        logger.error(`Service error updating customer ${customerId}: ${err.message}`);
        return callback(err);
      }
      
      logger.info(`Successfully updated customer ${customerId}`);
      callback(null, result);
    });
  }



};
module.exports = staffService;