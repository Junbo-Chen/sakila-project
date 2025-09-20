const staffService = require('../services/staff.service');
const { logger } = require('../util/logger');
const bcrypt = require("bcryptjs");


const validateCustomerData = (data) => {
  const errors = [];
  
  if (!data.first_name || data.first_name.trim().length < 1) {
    errors.push('Voornaam is verplicht');
  }
  if (!data.last_name || data.last_name.trim().length < 1) {
    errors.push('Achternaam is verplicht');
  }
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Voer een geldig e-mailadres in');
  }
  if (data.first_name && data.first_name.length > 45) {
    errors.push('Voornaam is te lang (maximaal 45 tekens)');
  }
  if (data.last_name && data.last_name.length > 45) {
    errors.push('Achternaam is te lang (maximaal 45 tekens)');
  }
  if (data.email && data.email.length > 50) {
    errors.push('E-mailadres is te lang (maximaal 50 tekens)');
  }
  
  return errors;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

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
    const page = parseInt(req.query.page) || 1;

    staffService.getActiveRentals(staffId, page, (err, data) => {
      if (err) {
        return res.render('error', { 
          title: 'Rentals Error', 
          message: err.message,
          error: err 
        });
      }
      
      res.render('staff/rentals', {
        title: 'Actieve Verhuur',
        rentals: data.rentals,
        currentPage: data.page,
        totalPages: data.pages
      });
    });
  },

  newRentalForm: (req, res) => {
    const staffId = req.session.user.staff_id || 1;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.search || '';
    const categoryFilter = req.query.category || '';

    staffService.getAvailableFilmsWithFilter(page, searchQuery, categoryFilter, (err, data) => { 
      if (err) {
        return res.render('error', { 
          title: 'Films Error', 
          message: err.message,
          error: err 
        });
      }

      res.render('staff/rentalCreate', {
        title: 'Nieuwe Verhuur',
        films: data.films,
        categories: data.categories,
        currentPage: data.page,
        totalPages: data.pages,
        searchQuery: searchQuery,
        selectedCategory: categoryFilter
      });
    });
  },

  createRental: (req, res) => {
    const { customer_id, inventory_id } = req.body;
    const staff_id = req.session.user.staff_id || 1;
    
    staffService.createRental(customer_id, inventory_id, staff_id, (err, rental) => {
      if (err) {
        logger.error(`Create rental error: ${err.message}`);
        return res.render('staff/rentalCreate', {
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
      
      res.json(customer);
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
  },

  createCustomer: (req, res) => {
    const { first_name, last_name, email, password, address, city, country } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.render('staff/customers', { error: 'Kon wachtwoord niet hashen' });
      }

      staffService.createCustomer(
        { first_name, last_name, email, password: hashedPassword, address, city, country },
        (err, result) => {
          if (err) {
            return res.render('staff/customers', { error: err.message });
          }
          res.redirect('/staff/customers');
        }
      );
    });
  },
  getCustomerEditForm: (req, res) => {
    const customerId = req.params.id;
    
    // Log voor developers, maar toon gebruiksvriendelijke boodschap
    if (!customerId || isNaN(customerId)) {
      logger.warn(`Invalid customer ID: ${customerId}`);
      return res.render('error', { 
        title: 'Klant niet gevonden', 
        message: 'De opgevraagde klant kon niet worden gevonden.',
        backUrl: '/staff/customers'
      });
    }
    
    staffService.getCustomerDetails(customerId, (err, customer) => {
      if (err) {
        // Log technische details voor developers
        logger.error(`Error fetching customer ${customerId}: ${err.message}`);
        
        // Toon eenvoudige boodschap aan gebruiker
        return res.render('error', { 
          title: 'Klant niet beschikbaar', 
          message: 'De klantgegevens kunnen momenteel niet worden geladen. Probeer het later opnieuw.',
          backUrl: '/staff/customers'
        });
      }
      
      if (!customer) {
        return res.render('error', { 
          title: 'Klant niet gevonden', 
          message: 'Deze klant bestaat niet of is niet meer beschikbaar.',
          backUrl: '/staff/customers'
        });
      }
      
      res.render('staff/customerEdit', {
        title: 'Klant Bewerken',
        customer: customer
      });
    });
  },

  updateCustomer: (req, res) => {
    const customerId = req.params.id;
    const { first_name, last_name, email, address, city, country, active } = req.body;

    if (!customerId || isNaN(customerId)) {
      logger.warn(`Invalid customer ID for update: ${customerId}`);
      return res.render('error', { 
        title: 'Klant niet gevonden', 
        message: 'De opgevraagde klant kon niet worden gevonden.',
        backUrl: '/staff/customers'
      });
    }

    const customerData = {
      first_name: first_name ? first_name.trim() : '',
      last_name: last_name ? last_name.trim() : '',
      email: email ? email.trim().toLowerCase() : '',
      address: address ? address.trim() : '',
      city: city ? city.trim() : '',
      country: country ? country.trim() : '',
      active: active === 'on' || active === '1' ? 1 : 0
    };

    // Valideer invoer
    const validationErrors = validateCustomerData(customerData);
    if (validationErrors.length > 0) {
      logger.info(`Validation failed for customer ${customerId}`);
      
      return staffService.getCustomerDetails(customerId, (err, customer) => {
        if (err) {
          return res.render('error', { 
            title: 'Er ging iets mis', 
            message: 'De pagina kan niet worden geladen. Probeer het opnieuw.',
            backUrl: '/staff/customers'
          });
        }
        
        res.render('staff/customerEdit', {
          title: 'Klant Bewerken',
          customer: customer || customerData,
          error: validationErrors.join('<br>')
        });
      });
    }

    // Update klant
    staffService.updateCustomer(customerId, customerData, (err, result) => {
      if (err) {
        // Log technische details
        logger.error(`Update customer error for ${customerId}: ${err.message}`);
        
        // Bepaal gebruiksvriendelijke boodschap
        let userMessage = getUserFriendlyMessage(err.message);
        
        return staffService.getCustomerDetails(customerId, (getErr, customer) => {
          if (getErr) {
            return res.render('error', { 
              title: 'Er ging iets mis', 
              message: 'De pagina kan niet worden geladen. Ga terug en probeer het opnieuw.',
              backUrl: '/staff/customers'
            });
          }
          
          const customerWithInput = customer ? { ...customer, ...customerData } : customerData;
          
          res.render('staff/customerEdit', {
            title: 'Klant Bewerken',
            customer: customerWithInput,
            error: userMessage
          });
        });
      } else {
        logger.info(`Customer ${customerId} updated successfully`);
        res.redirect('/staff/customers?success=De+klantgegevens+zijn+succesvol+bijgewerkt');
      }
    });
  }
};

// Vertaal technische errors naar gebruiksvriendelijke berichten
const getUserFriendlyMessage = (errorMessage) => {
  const message = errorMessage.toLowerCase();
  
  if (message.includes('duplicate') || message.includes('unique') || message.includes('email')) {
    return 'Dit e-mailadres wordt al gebruikt. Kies een ander e-mailadres.';
  }
  
  if (message.includes('not found') || message.includes('niet gevonden')) {
    return 'Deze klant kan niet worden gevonden.';
  }
  
  if (message.includes('connection') || message.includes('timeout') || message.includes('database')) {
    return 'Er is een tijdelijk probleem. Probeer het over een paar minuten opnieuw.';
  }
  
  if (message.includes('constraint') || message.includes('foreign key')) {
    return 'Deze klant kan niet worden gewijzigd omdat er nog actieve verhuur aan gekoppeld is.';
  }
  
  if (message.includes('too long') || message.includes('data too long')) {
    return 'Een van de ingevoerde gegevens is te lang. Controleer alle velden.';
  }
  
  // Algemene foutmelding voor onbekende fouten
  return 'Er ging iets mis bij het opslaan. Controleer de gegevens en probeer het opnieuw.';
};

module.exports = staffController;