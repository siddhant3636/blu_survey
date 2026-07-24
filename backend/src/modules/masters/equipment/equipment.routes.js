const express = require("express");
const equipmentController = require("./equipment.controller");
const validate = require("../../../middleware/validation.middleware");
const { createEquipmentSchema, updateEquipmentSchema } = require("./equipment.validation");
const { auth } = require("../../../middleware/auth.middleware");
const authorize = require("../../../middleware/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", equipmentController.getEquipments);
router.get("/:id", equipmentController.getEquipment);

router.post(
  "/",
  authorize("ADMIN"),
  validate(createEquipmentSchema),
  equipmentController.createEquipment
);

router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateEquipmentSchema),
  equipmentController.updateEquipment
);

router.patch(
  "/:id",
  authorize("ADMIN"),
  equipmentController.updateEquipment
);

router.patch(
  "/:id/toggle-status",
  authorize("ADMIN"),
  equipmentController.toggleStatus
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  equipmentController.deleteEquipment
);

module.exports = router;
