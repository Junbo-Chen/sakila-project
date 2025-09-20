var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Home',
    containerType: 'container'   // standaard
  });
});

router.get('/about', function(req, res, next) {
  res.render('about', { 
    title: 'About - Sakila Dashboard',
    containerType: 'container-fluid'  // speciale layout
  });
});

module.exports = router;