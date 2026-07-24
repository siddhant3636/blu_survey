const express = require("express");
const userController = require("./user.controller");
const validate = require("../../middleware/validation.middleware");
const { createUserSchema, updateUserSchema } = require("./user.validation");
const { auth } = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

const router = express.Router();

router.use(auth);
router.use(authorize("ADMIN", "SUB_ADMIN"));

router.get("/", userController.getUsers);
router.get("/:id", userController.getUser);
router.post("/", validate(createUserSchema), userController.createUser);
router.put("/:id", validate(updateUserSchema), userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
