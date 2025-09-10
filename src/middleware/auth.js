const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Middleware voor rol-gebaseerde toegang
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session.userRole || !allowedRoles.includes(req.session.userRole)) {
      return res.status(403).render('error', {
        title: 'Toegang Geweigerd',
        message: 'Je hebt geen toegang tot deze pagina',
        error: { status: 403 }
      });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };