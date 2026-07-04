// routes/adminRoutes.js

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");
const adminController = require("../controller/adminprofilecontroller");

router.get(
    "/profile",
    authMiddleware,
    adminController.getAdminProfile
);

module.exports = router;