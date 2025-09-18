
const { logger } = require('../util/logger');

const customerService = {
  getDashboardData: (customerId, callback) => {
    logger.info(`Getting dashboard data for customer ID: ${customerId}`);
    // Voor nu simpele mock data
    const mockData = {
      active_rentals: 0,
      total_rentals: 0,
      total_spent: 0.00,
      last_rental_date: null
    };
    callback(null, mockData);
  }
};

module.exports = customerService;