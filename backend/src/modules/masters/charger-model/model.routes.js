const express = require("express");
const modelController = require("./model.controller");
const validate = require("../../../middleware/validation.middleware");
const { createModelSchema, updateModelSchema } = require("./model.validation");
const { auth } = require("../../../middleware/auth.middleware");
const authorize = require("../../../middleware/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", modelController.getModels);
router.get("/:id", modelController.getModel);

router.post(
  "/",
  authorize("ADMIN"),
  validate(createModelSchema),
  modelController.createModel
);

router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateModelSchema),
  modelController.updateModel
);

router.patch(
  "/:id",
  authorize("ADMIN"),
  modelController.updateModel
);

router.patch(
  "/:id/toggle-status",
  authorize("ADMIN"),
  modelController.toggleStatus
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  modelController.deleteModel
);

module.exports = router;
