const express = require("express");
const dgController = require("./dg.controller");
const validate = require("../../middleware/validation.middleware");
const { createDGSchema } = require("./dg.validation");
const { auth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(auth);

router.post("/", validate(createDGSchema), dgController.addDG);
router.delete("/:id", dgController.removeDG);

module.exports = router;
