var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Bestaande routes
var indexRouter = require('./src/routes/index');
var actorRouter = require('./src/routes/actor');

// Nieuwe viewpoint routes
var staffRouter = require('./src/routes/staff');
var customerRouter = require('./src/routes/customer');
var authRouter = require('./src/routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src', 'public')));

const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET || 'sakila-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));

// Global variables voor views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.userRole = req.session.userRole || null;
  next();
});

// Routes
app.use('/', indexRouter);
app.use('/actor', actorRouter);
app.use('/auth', authRouter);
app.use('/staff', staffRouter);
app.use('/customer', customerRouter);
// app.use('/customer', customerRouter);

// catch 404
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;