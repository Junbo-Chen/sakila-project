const actorDAO = require("../dao/actor.dao");
const { logger } = require("../util/logger");

const actorService = {
  getAll: (callback) => {
    logger.info("Fetching all actors");
    actorDAO.getAll(callback);
  },
  
  getById: (id, callback) => {
    logger.info(`Fetching actor with ID: ${id}`);
    actorDAO.getById(id, callback);
  },
  
  createActor: (firstName, lastName, callback) => {
    logger.info(`Creating actor: ${firstName} ${lastName}`);
    actorDAO.create(firstName, lastName, callback);
  },
  
  updateActor: (id, firstName, lastName, callback) => {
    logger.info(`Updating actor ID ${id} to: ${firstName} ${lastName}`);
    actorDAO.update(id, firstName, lastName, callback);
  },
  
  deleteActor: (id, callback) => {
    logger.info(`Deleting actor with ID: ${id}`);
    actorDAO.delete(id, callback);
  }
};

module.exports = actorService;