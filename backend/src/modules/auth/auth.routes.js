const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middleware/validation.middleware");
const { loginSchema, registerSchema } = require("./auth.validation");
const { auth, authorize } = require("../../middleware/auth.middleware");

const router = express.Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/register", auth, authorize("ADMIN"), validate(registerSchema), authController.register);
router.get("/me", auth, authController.me);

module.exports = router;
