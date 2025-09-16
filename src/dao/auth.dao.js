const pool = require("../db/sql/connection");

const authDAO = {
  getStaffByEmail: (email, callback) => {
    pool.query(
      "SELECT staff_id, first_name, last_name, email, password FROM staff WHERE email = ?",
      [email],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0] || null);
      }
    );
  },

  getCustomerByEmail: (email, callback) => {
    pool.query(
      "SELECT customer_id, first_name, last_name, email FROM customer WHERE email = ?",
      [email],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0] || null);
      }
    );
  },

  getAdminByEmail: (email, callback) => {
    // Admin bestaat niet standaard in Sakila → we simuleren dit met staff id = 1
    pool.query(
      "SELECT staff_id, first_name, last_name, email FROM staff WHERE staff_id = 1 AND email = ?",
      [email],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0] || null);
      }
    );
  }
};

module.exports = authDAO;
