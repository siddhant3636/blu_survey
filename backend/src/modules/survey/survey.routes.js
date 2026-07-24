const express = require("express");
const surveyController = require("./survey.controller");
const validate = require("../../middleware/validation.middleware");
const {
  step1Schema,
  lockAssetSchema,
  saveAssetSchema,
  reviewSurveySchema,
} = require("./survey.validation");
const { auth } = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

const router = express.Router();

router.use(auth);

router.get("/", surveyController.getSurveys);
router.get("/site/:siteId", surveyController.getSurveyBySite);
router.get("/:id", surveyController.getSurvey);

router.post("/step1", validate(step1Schema), surveyController.initiateStep1);
router.post("/lock-asset", validate(lockAssetSchema), surveyController.lockAsset);
router.post("/unlock-asset", validate(lockAssetSchema), surveyController.unlockAsset);
router.post("/save-asset", validate(saveAssetSchema), surveyController.saveAssetData);

router.post("/:id/submit", surveyController.submitSurvey);
router.put("/:id", surveyController.updateSurvey);

router.post(
  "/:id/review",
  authorize("ADMIN", "SUB_ADMIN", "MANAGER"),
  validate(reviewSurveySchema),
  surveyController.reviewSurvey
);

module.exports = router;
