const express = require("express");
const surveySiteController = require("./surveySite.controller");
const validate = require("../../middleware/validation.middleware");
const { createSiteSchema, updateSiteSchema } = require("./surveySite.validation");
const { auth } = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", surveySiteController.getSites);
router.get("/:id", surveySiteController.getSite);

router.post(
  "/",
  authorize("ADMIN"),
  validate(createSiteSchema),
  surveySiteController.createSite
);

router.put(
  "/:id",
  authorize("ADMIN", "SUB_ADMIN"),
  validate(updateSiteSchema),
  surveySiteController.updateSite
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  surveySiteController.deleteSite
);

module.exports = router;
