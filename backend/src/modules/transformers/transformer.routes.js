const express = require("express");
const transformerController = require("./transformer.controller");
const validate = require("../../middleware/validation.middleware");
const { createTransformerSchema } = require("./transformer.validation");
const { auth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(auth);

router.post("/", validate(createTransformerSchema), transformerController.addTransformer);
router.delete("/:id", transformerController.removeTransformer);

module.exports = router;
