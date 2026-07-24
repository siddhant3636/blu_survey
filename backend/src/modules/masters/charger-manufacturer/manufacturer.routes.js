const express = require("express");
const manufacturerController = require("./manufacturer.controller");
const validate = require("../../../middleware/validation.middleware");
const { createManufacturerSchema, updateManufacturerSchema } = require("./manufacturer.validation");
const { auth } = require("../../../middleware/auth.middleware");
const authorize = require("../../../middleware/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", manufacturerController.getManufacturers);
router.get("/:id", manufacturerController.getManufacturer);

router.post(
  "/",
  authorize("ADMIN"),
  validate(createManufacturerSchema),
  manufacturerController.createManufacturer
);

router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateManufacturerSchema),
  manufacturerController.updateManufacturer
);

router.patch(
  "/:id",
  authorize("ADMIN"),
  manufacturerController.updateManufacturer
);

router.patch(
  "/:id/toggle-status",
  authorize("ADMIN"),
  manufacturerController.toggleStatus
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  manufacturerController.deleteManufacturer
);

module.exports = router;
