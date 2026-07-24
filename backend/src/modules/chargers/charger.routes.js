const express = require("express");
const chargerController = require("./charger.controller");
const validate = require("../../middleware/validation.middleware");
const { createChargerSchema } = require("./charger.validation");
const { auth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(auth);

router.post("/", validate(createChargerSchema), chargerController.addCharger);
router.delete("/:id", chargerController.removeCharger);

module.exports = router;
