// const actorDAO = require("../dao/actor.dao");
const actorService = require("../services/actor.service");

const actorController = {
  getAll: (req, res, next) => {
    actorService.getAll((err, actors) => {
      if (err) {
        return next(err);
      }
      res.render("actor/index", { actors, title: "Actors lijst" });
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

// async function listActors(req, res, next) {
//   try {
//     const actors = await actorDAO.getAll();
//     res.render('actor/index', { actors, title: 'Actors lijst' });
//   } catch (err) {
//     next(err);
//   }
// }

// async function addActor(req, res, next) {
//   try {
//     const { firstName, lastName } = req.body;
//     await actorDAO.create(firstName, lastName);
//     res.redirect("/actor");
//   } catch (err) {
//     next(err);
//   }
// }

// async function editActor(req, res, next) {
//   try {
//     const { id } = req.params;
//     const { firstName, lastName } = req.body;
//     await actorDAO.update(id, firstName, lastName);
//     res.redirect("/actor");
//   } catch (err) {
//     next(err);
//   }
// }

// async function deleteActor(req, res, next) {
//   try {
//     const { id } = req.params;
//     await actorDAO.delete(id);
//     res.redirect("/actor");
//   } catch (err) {
//     next(err);
//   }
// }
