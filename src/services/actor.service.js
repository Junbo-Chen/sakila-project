const { validate } = require("../controllers/actor.controller");
const actorDAO = require("../dao/actor.dao");
const { logger } = require("../util/logger");

const actorService = {
  validate: validate,
  getAll: (callback) => {
    logger.info("Fetching all actors");
    actorDAO.getAll(callback);
  },
  
  getById: (id, callback) => {
    logger.info(`Fetching actor with ID: ${id}`);
    actorDAO.getById(id, callback,(result, err) => {
      if (err) {
        logger.error(`Error fetching actor with ID ${id}: ${err.message}`);
        return callback(err);
      }
      if (!result) {
        logger.warn(`No actor found with ID: ${id}`);
        return callback(null, null);
      }
    });
  },
  
  createActor: (firstName, lastName, callback) => {
    logger.info(`Creating actor: ${firstName} ${lastName}`);
    actorDAO.create(firstName, lastName, callback,(err, result) => {
      if (err) {
        logger.error(`Error creating actor ${firstName} ${lastName}: ${err.message}`);
        return callback(err);
      }
      callback(null, result);
    });
  },
  
  updateActor: (id, firstName, lastName, callback) => {
    logger.info(`Updating actor ID ${id} to: ${firstName} ${lastName}`);
    actorDAO.update(id, firstName, lastName, callback,(err, result) => {
      if (err) {
        logger.error(`Error updating actor ID ${id}: ${err.message}`);
        return callback(err);
      }
      callback(null, result);
    });
  },
  
  deleteActor: (id, callback) => {
    logger.info(`Deleting actor with ID: ${id}`);
    actorDAO.delete(id, callback,(err, result) => {
      if (err) {
        logger.error(`Error deleting actor ID ${id}: ${err.message}`);
        return callback(err);
      }
      callback(null, result);
    });
  }
};

module.exports = actorService;