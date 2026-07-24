const express = require("express");
const photoCategoryController = require("./photoCategory.controller");
const validate = require("../../../middleware/validation.middleware");
const { createCategorySchema, updateCategorySchema } = require("./photoCategory.validation");
const { auth } = require("../../../middleware/auth.middleware");
const authorize = require("../../../middleware/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", photoCategoryController.getCategories);
router.get("/:id", photoCategoryController.getCategory);

router.post(
  "/",
  authorize("ADMIN"),
  validate(createCategorySchema),
  photoCategoryController.createCategory
);

router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateCategorySchema),
  photoCategoryController.updateCategory
);

router.patch(
  "/:id",
  authorize("ADMIN"),
  photoCategoryController.updateCategory
);

router.patch(
  "/:id/toggle-status",
  authorize("ADMIN"),
  photoCategoryController.toggleStatus
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  photoCategoryController.deleteCategory
);

module.exports = router;
