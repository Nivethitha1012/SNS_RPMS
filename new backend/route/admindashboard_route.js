const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");

const dashboardController = require("../controller/admindashboard_con");

router.get(
    "/",
    authMiddleware,
    dashboardController.getDashboard
);

router.get(
    "/export",
    authMiddleware,
    dashboardController.exportDashboardData
);

module.exports = router;