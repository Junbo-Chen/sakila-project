const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Login pagina
router.get('/login', (req, res) => {
  res.render('auth/login', { 
    title: 'Login',
    error: null 
  });
});

// Login verwerken
router.post('/login', authController.login);

// Logout
router.get('/logout', authController.logout);

// Demo login buttons (voor testing)
router.post('/demo-login/:role', authController.demoLogin);

module.exports = router;