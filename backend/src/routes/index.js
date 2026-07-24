const express = require("express");
const apiRoutes = require("./api");

const router = express.Router();

router.use("/api/v1", apiRoutes);

module.exports = router;
