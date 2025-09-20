const bcrypt = require("bcryptjs");
const authDAO = require("../dao/auth.dao");

const authService = {
  validate: (email, password, role, callback) => {
    if (!email || !role) {
      return callback(new Error("Email en rol zijn verplicht"));
    }
    if (!password) {
      return callback(new Error("Wachtwoord is verplicht"));
    }
    return callback(null);
  },

  authenticateUser: (email, password, role, callback) => {
    switch (role) {
      case "staff":
        authDAO.getStaffByEmail(email, (err, user) => {
          if (err) return callback(err);
          if (!user) return callback(null, null);
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return callback(err);
            if (!isMatch) return callback(new Error("Invalid password"));
            return callback(null, user);
          });
        });
        break;

      case "customer":
        authDAO.getCustomerByEmail(email, (err, user) => {
          if (err) return callback(err);
          if (!user) return callback(null, null);
          
          // Check if user has a password field
          if (!user.password) {
            return callback(new Error("No password set for this customer"));
          }
          
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return callback(err);
            if (!isMatch) return callback(new Error("Invalid password"));
            return callback(null, user);
          });
        });
        break;

      default:
        callback(new Error("Unknown role"));
    }
  }
};

module.exports = authService;