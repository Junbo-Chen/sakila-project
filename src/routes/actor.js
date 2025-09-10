const express = require("express");
const router = express.Router();
const actorController = require("../controllers/actor.controller");
const { route } = require(".");

router.get('/', actorController.getAll);
router.post('/add', actorController.add);
router.post('/edit/:id', actorController.validate, actorController.edit);
router.post('/delete/:id', actorController.delete);

module.exports = router;