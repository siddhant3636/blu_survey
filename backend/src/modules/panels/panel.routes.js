const express = require("express");
const panelController = require("./panel.controller");
const validate = require("../../middleware/validation.middleware");
const { createPanelSchema } = require("./panel.validation");
const { auth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(auth);

router.post("/", validate(createPanelSchema), panelController.addPanel);
router.delete("/:id", panelController.removePanel);

module.exports = router;
