const customerService = require('../services/customer.service');
const { logger } = require('../util/logger');

const customerController = {
  dashboard: (req, res) => {
    // Simpele dashboard eerst - later kunnen we meer data toevoegen
    res.render('customer/dashboard', {
      title: 'Customer Dashboard',
      user: req.session.user
    });
  },
};

module.exports = customerController;