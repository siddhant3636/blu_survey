const express = require("express");
const connectorController = require("./connector.controller");
const validate = require("../../../middleware/validation.middleware");
const { createConnectorSchema, updateConnectorSchema } = require("./connector.validation");
const { auth } = require("../../../middleware/auth.middleware");
const authorize = require("../../../middleware/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", connectorController.getConnectors);
router.get("/:id", connectorController.getConnector);

router.post(
  "/",
  authorize("ADMIN"),
  validate(createConnectorSchema),
  connectorController.createConnector
);

router.put(
  "/:id",
  authorize("ADMIN"),
  validate(updateConnectorSchema),
  connectorController.updateConnector
);

router.patch(
  "/:id",
  authorize("ADMIN"),
  connectorController.updateConnector
);

router.patch(
  "/:id/toggle-status",
  authorize("ADMIN"),
  connectorController.toggleStatus
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  connectorController.deleteConnector
);

module.exports = router;
