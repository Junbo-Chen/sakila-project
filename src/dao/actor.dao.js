const pool = require("../db/sql/connection");
const Actor = require("../models/actor");

const actorDAO = {
  getAll(callback) {
    console.log('🔍 Attempting to fetch all actors...');
    pool.query(
      "SELECT actor_id, first_name, last_name FROM actor",
      (err, rows) => {
        if (err) {
          console.error("❌ Error in getAll:", err);
          console.error("Error details:", {
            message: err.message,
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState,
            sqlMessage: err.sqlMessage
          });
          return callback(new Error(`Database error while fetching actors: ${err.message}`));
        }
        
        console.log(`✅ Successfully fetched ${rows.length} actors`);
        const actors = rows.map(
          row => new Actor(row.actor_id, row.first_name, row.last_name)
        );
        callback(null, actors);
      }
    );
  },

  getById(id, callback) {
    console.log(`🔍 Attempting to fetch actor with ID: ${id}`);
    pool.query(
      "SELECT actor_id, first_name, last_name FROM actor WHERE actor_id = ?",
      [id],
      (err, rows) => {
        if (err) {
          console.error("❌ Error in getById:", err);
          return callback(new Error(`Database error while fetching actor by ID: ${err.message}`));
        }
        
        if (rows.length === 0) {
          return callback(null, null);
        }
        
        const row = rows[0];
        console.log(`✅ Successfully fetched actor: ${row.first_name} ${row.last_name}`);
        const actor = new Actor(row.actor_id, row.first_name, row.last_name);
        callback(null, actor);
      }
    );
  },

  create(firstName, lastName, callback) {
    console.log(`🔍 Attempting to create actor: ${firstName} ${lastName}`);
    pool.query(
      "INSERT INTO actor (first_name, last_name) VALUES (?, ?)",
      [firstName, lastName],
      (err, result) => {
        if (err) {
          console.error("❌ Error in create:", err);
          return callback(new Error(`Database error while creating actor: ${err.message}`));
        }
        
        console.log(`✅ Successfully created actor with ID: ${result.insertId}`);
        const actor = new Actor(result.insertId, firstName, lastName);
        callback(null, actor);
      }
    );
  },

  update(id, firstName, lastName, callback) {
    console.log(`🔍 Attempting to update actor ID ${id}: ${firstName} ${lastName}`);
    pool.query(
      "UPDATE actor SET first_name = ?, last_name = ? WHERE actor_id = ?",
      [firstName, lastName, id],
      (err, result) => {
        if (err) {
          console.error("❌ Error in update:", err);
          return callback(new Error(`Database error while updating actor: ${err.message}`));
        }
        
        console.log(`✅ Successfully updated actor ID: ${id}`);
        // Get the updated actor and return it
        this.getById(id, callback);
      }
    );
  },

  delete(id, callback) {
    console.log(`🔍 Attempting to delete actor ID: ${id}`);
    pool.query(
      "DELETE FROM actor WHERE actor_id = ?",
      [id],
      (err, result) => {
        if (err) {
          console.error("❌ Error in delete:", err);
          return callback(new Error(`Database error while deleting actor: ${err.message}`));
        }
        
        console.log(`✅ Successfully deleted actor ID: ${id}`);
        callback(null, true);
      }
    );
  }
};

module.exports = actorDAO;