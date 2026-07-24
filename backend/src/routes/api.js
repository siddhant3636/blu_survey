const express = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/user.routes");
const dashboardRoutes = require("../modules/dashboard/dashboard.routes");
const surveySiteRoutes = require("../modules/survey-sites/surveySite.routes");
const assignmentRoutes = require("../modules/survey-assignment/assignment.routes");
const surveyRoutes = require("../modules/survey/survey.routes");
const chargerRoutes = require("../modules/chargers/charger.routes");
const panelRoutes = require("../modules/panels/panel.routes");
const transformerRoutes = require("../modules/transformers/transformer.routes");
const dgRoutes = require("../modules/dg/dg.routes");
const photoRoutes = require("../modules/photos/photo.routes");
const reportRoutes = require("../modules/reports/report.routes");
const settingsRoutes = require("../modules/settings/settings.routes");

// Masters
const manufacturerRoutes = require("../modules/masters/charger-manufacturer/manufacturer.routes");
const modelRoutes = require("../modules/masters/charger-model/model.routes");
const connectorRoutes = require("../modules/masters/connector/connector.routes");
const equipmentRoutes = require("../modules/masters/equipment/equipment.routes");
const photoCategoryRoutes = require("../modules/masters/photo-category/photoCategory.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/survey-sites", surveySiteRoutes);
router.use("/survey-assignment", assignmentRoutes);
router.use("/survey-assignments", assignmentRoutes);
router.use("/surveys", surveyRoutes);
router.use("/survey", surveyRoutes);
router.use("/chargers", chargerRoutes);
router.use("/panels", panelRoutes);
router.use("/transformers", transformerRoutes);
router.use("/dg", dgRoutes);
router.use("/photos", photoRoutes);
router.use("/reports", reportRoutes);
router.use("/settings", settingsRoutes);

// Masters sub-routes
router.use("/masters/charger-manufacturer", manufacturerRoutes);
router.use("/masters/charger-model", modelRoutes);
router.use("/masters/connector", connectorRoutes);
router.use("/masters/equipment", equipmentRoutes);
router.use("/masters/photo-category", photoCategoryRoutes);

module.exports = router;


