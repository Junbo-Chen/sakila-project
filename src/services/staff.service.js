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

  getInventory: (callback) => {
    logger.info('Getting inventory overview');
    staffDAO.getInventory(callback);
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

  // New inventory management services
  addFilm: (filmData, staffId, callback) => {
    logger.info(`Adding new film: ${filmData.title} by staff ${staffId}`);
    
    // Validate required fields
    if (!filmData.title || !filmData.rental_rate) {
      return callback(new Error('Titel en verhuur tarief zijn verplicht'));
    }
    
    // Ensure positive rental rate
    if (parseFloat(filmData.rental_rate) <= 0) {
      return callback(new Error('Verhuur tarief moet positief zijn'));
    }
    
    staffDAO.addFilm(filmData, callback);
  },

  addFilmCopy: (filmId, copies, staffId, callback) => {
    logger.info(`Adding ${copies} copies to film ID: ${filmId} by staff ${staffId}`);
    
    if (!filmId || copies <= 0) {
      return callback(new Error('Ongeldig film ID of aantal kopiëen'));
    }
    
    staffDAO.addFilmCopy(filmId, copies, callback);
  },

  removeFilmCopy: (filmId, copies, staffId, callback) => {
    logger.info(`Removing ${copies} copies from film ID: ${filmId} by staff ${staffId}`);
    
    if (!filmId || copies <= 0) {
      return callback(new Error('Ongeldig film ID of aantal kopiëen'));
    }
    
    // Check if we can safely remove copies (ensure at least 1 remains available)
    staffDAO.getFilmAvailability(filmId, (err, availability) => {
      if (err) return callback(err);
      
      const availableCopies = availability.total_copies - availability.rented_out;
      if (availableCopies <= copies) {
        return callback(new Error('Kan niet alle kopiëen verwijderen - er moet minimaal 1 kopie beschikbaar blijven'));
      }
      
      staffDAO.removeFilmCopy(filmId, copies, callback);
    });
  },

  updateFilm: (filmId, filmData, staffId, callback) => {
    logger.info(`Updating film ID: ${filmId} by staff ${staffId}`);
    
    if (!filmId) {
      return callback(new Error('Film ID is verplicht'));
    }
    
    // Validate rental rate if provided
    if (filmData.rental_rate && parseFloat(filmData.rental_rate) <= 0) {
      return callback(new Error('Verhuur tarief moet positief zijn'));
    }
    
    staffDAO.updateFilm(filmId, filmData, callback);
  },

  bulkAddCopies: (filmIds, copies, staffId, callback) => {
    logger.info(`Bulk adding ${copies} copies to ${filmIds.length} films by staff ${staffId}`);
    
    if (!filmIds || filmIds.length === 0 || copies <= 0) {
      return callback(new Error('Ongeldige film selectie of aantal kopiëen'));
    }
    
    staffDAO.bulkAddCopies(filmIds, copies, callback);
  },

  bulkUpdateRates: (filmIds, newRate, staffId, callback) => {
    logger.info(`Bulk updating rates to €${newRate} for ${filmIds.length} films by staff ${staffId}`);
    
    if (!filmIds || filmIds.length === 0 || parseFloat(newRate) <= 0) {
      return callback(new Error('Ongeldige film selectie of tarief'));
    }
    
    staffDAO.bulkUpdateRates(filmIds, newRate, callback);
  },
};
module.exports = staffService;