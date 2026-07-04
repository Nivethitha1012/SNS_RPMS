// routes/facultyRoutes.js

const express = require("express");
const router = express.Router();
const facultyController = require("../controller/facultyprofile_controller");

const authMiddleware = require("../middleware/authmiddleware.js");


router.get("/profile", authMiddleware, facultyController.getFacultyProfile);

module.exports = router;