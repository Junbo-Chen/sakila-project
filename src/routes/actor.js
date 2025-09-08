const express = require("express");
const router = express.Router();
const actorController = require("../controllers/actor.controller");

router.get('/', actorController.getAll);
router.post('/add', actorController.add);
router.post('/edit/:id', actorController.edit);
router.post('/delete/:id', actorController.delete);

module.exports = router;