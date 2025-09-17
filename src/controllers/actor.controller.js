
const actorService = require("../services/actor.service");
const logger = require("../util/logger");
const { expect } = require("chai");

const actorController = {
   validate: (req, res, next) => {
    const { firstName, lastName } = req.body;
    const userId = req.params.id; // alleen gebruiken als je nodig hebt

    actorService.validate(firstName, lastName, (error) => {
      if (error) {
        logger.error(`Validation error: ${error.message}`);
        return res.status(400).json({ error: error.message });
      }
      next(); // belangrijk, anders komt request nooit verder
    });
  },
    
  getAll: (req, res, next) => {
    actorService.getAll((err, actors) => {
      if (err) {
        return next(err);
      }
      res.render("actor/index", { actors, title: "Actors lijst" });
    });
  },
  
  getById: (req, res, next) => {
    const { id } = req.params;
    actorService.getById(id, (err, actor) => {
      if (err) {
        return next(err);
      }
      res.render("actor/detail", { actor, title: "Actor detail" });
    });
  },
  add: (req, res, next) => {
    const { firstName, lastName } = req.body;
    actorService.createActor(firstName, lastName, (err, actor) => {
      if (err) {
        return next(err);
      }
      res.redirect("/actor");
    });
  },
  
  edit: (req, res, next) => {
    const { id } = req.params;
    const { firstName, lastName } = req.body;
    actorService.updateActor(id, firstName, lastName, (err, actor) => {
      if (err) {
        return next(err);
      }
      res.redirect("/actor");
    });
  },
  
  delete: (req, res, next) => {
    const { id } = req.params;
    actorService.deleteActor(id, (err, result) => {
      if (err) {
        return next(err);
      }
      res.redirect("/actor");
    });
  }
};

module.exports = actorController;

