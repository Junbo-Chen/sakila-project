const express = require("express");
const router = express.Router();
const actorController = require("../controllers/actor.controller");
const authController = require("../controllers/auth.controller");
const { route } = require(".");

router.get('/', actorController.getAll);
router.post('/add', authController.isLoggedIn, actorController.add);
router.post('/edit/:id', authController.isLoggedIn,actorController.validate, actorController.edit);
router.post('/delete/:id', authController.isLoggedIn,actorController.delete);

module.exports = router;