const authService = require('../services/auth.service');
const { logger } = require('../util/logger');
// const { validate } = require('./actor.controller');

const authController = {
  validate: (req, res, next) => {
    const { email, password, role } = req.body;
    authService.validate(email, password, role, (error) => {
      if (error) {
        logger.error(`Validation error: ${error.message}`);
        return res.render('auth/login', {
          title: 'Login',
          error: error.message
        });
      }
      next();
    });
  },
  login: (req, res) => {
    const { email, password, role } = req.body;
    
    authService.authenticateUser(email, password, role, (err, user) => {
      if (err) {
        logger.error(`Login error: ${err.message}`);
        return res.render('auth/login', {
          title: 'Login',
          error: 'Ongeldige inloggegevens'
        });
      }
      
      if (!user) {
        return res.render('auth/login', {
          title: 'Login',
          error: 'Gebruiker niet gevonden'
        });
      }
      
      // Session instellen
      req.session.user = user;
      req.session.userRole = role;
      
      logger.info(`User ${user.first_name} logged in as ${role}`);
      
      switch (role) {
        case 'staff':
          res.redirect('/staff/dashboard');
          break;
        case 'customer':
          res.redirect('/customer/dashboard');
          break;
        default:
          res.redirect('/');
      }
    });
  },
  
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        logger.error(`Logout error: ${err.message}`);
      }
      res.redirect('/auth/login');
    });
  },
  isLoggedIn: (req, res, next) => {
    if (req.session && req.session.user) {
      next();
    } else {
      res.redirect('/auth/login');
    }
  },

};

module.exports = authController;