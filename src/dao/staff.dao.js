const pool = require('../db/sql/connection');
const staff = require('../models/staff');

const staffDAO = {
  getDashboardStats: (staffId, callback) => {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM rental r WHERE r.staff_id = ? AND r.return_date IS NULL) as active_rentals,
        (SELECT COUNT(*) FROM rental r WHERE r.staff_id = ? AND DATE(r.rental_date) = CURDATE()) as todays_rentals,
        (SELECT COALESCE(SUM(p.amount), 0) FROM payment p WHERE p.staff_id = ? AND DATE(p.payment_date) = CURDATE()) as todays_revenue,
        (SELECT COUNT(DISTINCT r.customer_id) FROM rental r WHERE r.staff_id = ?) as total_customers
    `;

    pool.query(query, [staffId, staffId, staffId, staffId], (err, rows) => {
      if (err) {
        console.error('❌ Error in getDashboardStats:', err);
        return callback(new Error(`Database error: ${err.message}`));
      }

      const stats = rows[0];
      // ✅ Forceer number ipv string
      stats.active_rentals = parseInt(stats.active_rentals) || 0;
      stats.todays_rentals = parseInt(stats.todays_rentals) || 0;
      stats.todays_revenue = parseFloat(stats.todays_revenue) || 0;
      stats.total_customers = parseInt(stats.total_customers) || 0;

      console.log('✅ Successfully fetched dashboard stats');
      callback(null, stats);
    });
  },

  getActiveRentals: (staffId, page, callback) => {
    const limit = 15;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        r.rental_id,
        r.rental_date,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        c.customer_id,
        f.title as film_title,
        f.rental_rate,
        DATEDIFF(CURDATE(), r.rental_date) as days_rented
      FROM rental r
      JOIN customer c ON r.customer_id = c.customer_id
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      WHERE r.staff_id = ? AND r.return_date IS NULL
      ORDER BY r.rental_date DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM rental r
      WHERE r.staff_id = ? AND r.return_date IS NULL
    `;

    pool.query(query, [staffId, limit, offset], (err, rows) => {
      if (err) return callback(err);

      pool.query(countQuery, [staffId], (err2, countRows) => {
        if (err2) return callback(err2);

        callback(null, {
          rentals: rows,
          total: countRows[0].total,
          page,
          pages: Math.ceil(countRows[0].total / limit)
        });
      });
    });
  },

  getAvailableFilmsWithFilter: (page, searchQuery, categoryFilter, callback) => {
    const limit = 24;
    const offset = (page - 1) * limit;
    
    // Build the WHERE clause dynamically
    let whereConditions = ['r.rental_id IS NULL'];
    let queryParams = [];
    
    if (searchQuery && searchQuery.trim() !== '') {
      whereConditions.push('(f.title LIKE ? OR f.description LIKE ?)');
      const searchPattern = `%${searchQuery.trim()}%`;
      queryParams.push(searchPattern, searchPattern);
    }
    
    if (categoryFilter && categoryFilter.trim() !== '') {
      whereConditions.push('LOWER(c.name) = LOWER(?)');
      queryParams.push(categoryFilter.trim());
    }
    
    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        f.film_id,
        f.title,
        f.description,
        f.rental_rate,
        f.length,
        f.rating,
        COUNT(i.inventory_id) as available_copies,
        MAX(c.name) as category
      FROM film f
      JOIN film_category fc ON f.film_id = fc.film_id
      JOIN category c ON fc.category_id = c.category_id
      JOIN inventory i ON f.film_id = i.film_id
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id AND r.return_date IS NULL
      WHERE ${whereClause}
      GROUP BY f.film_id, f.title, f.description, f.rental_rate, f.length, f.rating
      HAVING available_copies > 0
      ORDER BY f.title
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT f.film_id) as total
      FROM film f
      JOIN film_category fc ON f.film_id = fc.film_id
      JOIN category c ON fc.category_id = c.category_id
      JOIN inventory i ON f.film_id = i.film_id
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id AND r.return_date IS NULL
      WHERE ${whereClause}
      GROUP BY f.film_id
      HAVING COUNT(i.inventory_id) - SUM(CASE WHEN r.rental_id IS NOT NULL THEN 1 ELSE 0 END) > 0
    `;

    // Get categories for the filter dropdown
    const categoriesQuery = `
      SELECT DISTINCT c.name 
      FROM category c 
      JOIN film_category fc ON c.category_id = fc.category_id 
      JOIN film f ON fc.film_id = f.film_id 
      JOIN inventory i ON f.film_id = i.film_id 
      ORDER BY c.name
    `;

    // Add pagination parameters
    queryParams.push(limit, offset);

    pool.query(query, queryParams, (err, rows) => {
      if (err) {
        console.error('❌ Error in getAvailableFilmsWithFilter:', err);
        return callback(new Error(`Database error: ${err.message}`));
      }

      // Get total count (without LIMIT/OFFSET params)
      const countParams = queryParams.slice(0, -2);
      pool.query(countQuery, countParams, (err2, countRows) => {
        if (err2) return callback(err2);

        // Get categories
        pool.query(categoriesQuery, (err3, categoryRows) => {
          if (err3) return callback(err3);

          const total = countRows.length; // Count of distinct films
          const pages = Math.ceil(total / limit);
          const categories = categoryRows.map(row => row.name);

          console.log(`✅ Successfully fetched ${rows.length} filtered films (Page ${page} of ${pages})`);
          console.log(`   Search: "${searchQuery}", Category: "${categoryFilter}"`);
          
          callback(null, { 
            films: rows,
            categories: categories,
            total: total,
            page,
            pages: pages
          });
        });
      });
    });
  },

  createRental: (customerId, inventoryId, staffId, callback) => {
    const query = `
      INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id)
      VALUES (NOW(), ?, ?, ?)
    `;
    
    pool.query(query, [inventoryId, customerId, staffId], (err, result) => {
      if (err) {
        console.error('❌ Error in createRental:', err);
        return callback(new Error(`Database error: ${err.message}`));
      }
      
      console.log(`✅ Successfully created rental with ID: ${result.insertId}`);
      callback(null, { rental_id: result.insertId });
    });
  },

  returnRental: (rentalId, callback) => {
    const query = `
      UPDATE rental 
      SET return_date = NOW() 
      WHERE rental_id = ? AND return_date IS NULL
    `;
    
    pool.query(query, [rentalId], (err, result) => {
      if (err) {
        console.error('❌ Error in returnRental:', err);
        return callback(new Error(`Database error: ${err.message}`));
      }
      
      if (result.affectedRows === 0) {
        return callback(new Error('Rental niet gevonden of al geretourneerd'));
      }
      
      console.log(`✅ Successfully returned rental ID: ${rentalId}`);
      callback(null, true);
    });
  },

  getCustomers: (callback) => {
    const query = `
      SELECT 
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) as full_name,
        c.email,
        c.active,
        a.address,
        ci.city,
        co.country,
        COUNT(r.rental_id) as total_rentals,
        MAX(r.rental_date) as last_rental
      FROM customer c
      LEFT JOIN address a ON c.address_id = a.address_id
      LEFT JOIN city ci ON a.city_id = ci.city_id
      LEFT JOIN country co ON ci.country_id = co.country_id
      LEFT JOIN rental r ON c.customer_id = r.customer_id
      GROUP BY c.customer_id
      ORDER BY c.last_name, c.first_name
      LIMIT 100
    `;
    
    pool.query(query, (err, rows) => {
      if (err) {
        console.error('❌ Error in getCustomers:', err);
        return callback(new Error(`Database error: ${err.message}`));
      }
      
      console.log(`✅ Successfully fetched ${rows.length} customers`);
      callback(null, rows);
    });
  },

  searchCustomers: (searchTerm, callback) => {
    const query = `
      SELECT 
        c.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) as full_name,
        c.email,
        c.active
      FROM customer c
      WHERE c.first_name LIKE ? 
         OR c.last_name LIKE ? 
         OR c.email LIKE ?
      ORDER BY c.last_name, c.first_name
      LIMIT 20
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    pool.query(query, [searchPattern, searchPattern, searchPattern], (err, rows) => {
      if (err) {
        console.error('❌ Error in searchCustomers:', err);
        return callback(new Error(`Database error: ${err.message}`));
      }
      
      console.log(`✅ Successfully found ${rows.length} customers`);
      callback(null, rows);
    });
  },

  getCustomerDetails: (customerId, callback) => {
    const query = `
      SELECT 
        c.*,
        a.address,
        a.district,
        a.postal_code,
        ci.city,
        co.country,
        COUNT(r.rental_id) as total_rentals,
        COALESCE(SUM(p.amount), 0) as total_paid,
        MAX(r.rental_date) as last_rental_date
      FROM customer c
      LEFT JOIN address a ON c.address_id = a.address_id
      LEFT JOIN city ci ON a.city_id = ci.city_id
      LEFT JOIN country co ON ci.country_id = co.country_id
      LEFT JOIN rental r ON c.customer_id = r.customer_id
      LEFT JOIN payment p ON r.rental_id = p.rental_id
      WHERE c.customer_id = ?
      GROUP BY c.customer_id
    `;
    
    pool.query(query, [customerId], (err, rows) => {
      if (err) {
        console.error('❌ Error in getCustomerDetails:', err);
        return callback(new Error(`Database error: ${err.message}`));
      }
      
      if (rows.length === 0) {
        return callback(new Error('Klant niet gevonden'));
      }
      
      console.log(`✅ Successfully fetched customer details for ID: ${customerId}`);
      callback(null, rows[0]);
    });
  },

    getInventory: (callback) => {
    const query = `
      SELECT 
        f.film_id,
        f.title,
        f.description,
        f.release_year,
        f.rental_rate,
        f.length,
        f.rating,
        COUNT(i.inventory_id) as total_copies,
        SUM(CASE WHEN r.return_date IS NULL THEN 1 ELSE 0 END) as rented_out
      FROM film f
      JOIN inventory i ON f.film_id = i.film_id
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id AND r.return_date IS NULL
      GROUP BY f.film_id
      ORDER BY f.title
      LIMIT 100
    `;
    
    pool.query(query, (err, rows) => {
      if (err) {
        console.error('❌ Error in getInventory:', err);
        return callback(new Error(`Database error: ${err.message}`));
      }
      callback(null, rows);
    });
  },

  searchFilms: (searchTerm, callback) => {
    const query = `
      SELECT 
        f.film_id,
        f.title,
        f.description,
        f.release_year,
        f.rental_rate,
        f.length,
        f.rating,
        COUNT(i.inventory_id) as total_copies,
        SUM(CASE WHEN r.return_date IS NULL THEN 1 ELSE 0 END) as rented_out
      FROM film f
      JOIN inventory i ON f.film_id = i.film_id
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id AND r.return_date IS NULL
      WHERE f.title LIKE ? OR f.description LIKE ?
      GROUP BY f.film_id
      ORDER BY f.title
      LIMIT 20
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    pool.query(query, [searchPattern, searchPattern], (err, rows) => {
      if (err) {
        console.error('❌ Error in searchFilms:', err);
        return callback(new Error(`Database error: ${err.message}`));
      }
      callback(null, rows);
    });
  },

  getRecentPayments: (staffId, callback) => {
    const query = `
      SELECT 
        p.payment_id,
        p.amount,
        p.payment_date,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        f.title as film_title
      FROM payment p
      JOIN customer c ON p.customer_id = c.customer_id
      JOIN rental r ON p.rental_id = r.rental_id
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      WHERE p.staff_id = ?
      ORDER BY p.payment_date DESC
      LIMIT 50
    `;
    
    pool.query(query, [staffId], (err, rows) => {
      if (err) {
        console.error('❌ Error in getRecentPayments:', err);
        return callback(new Error(`Database error: ${err.message}`));
      }
      callback(null, rows);
    });
  }
};

module.exports = staffDAO;