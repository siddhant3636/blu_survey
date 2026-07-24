const express = require("express");
const dashboardController = require("./dashboard.controller");
const { auth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", auth, dashboardController.getDashboardStats);

module.exports = router;
