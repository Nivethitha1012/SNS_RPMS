const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware.js");
const upload = require("../middleware/uploadpdfsoft");

const submissionController = require("../controller/facultysubmission_con");

router.post(
    "/create",
    authMiddleware,
    upload.single("manuscript"),
    submissionController.createSubmission
);

module.exports = router;