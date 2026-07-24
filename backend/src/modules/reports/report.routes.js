const express = require("express");
const reportController = require("./report.controller");
const { auth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(auth);

router.get("/:surveyId/excel", reportController.downloadExcelReport);
router.get("/:surveyId/pdf", reportController.downloadPDFReport);

module.exports = router;
