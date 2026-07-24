const express = require("express");
const settingsController = require("./settings.controller");
const { auth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(auth);

router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSetting);

module.exports = router;
