const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");
const submissionQueueController = require("../controller/adminsubmissionqueue_con");

router.get(
    "/",
    authMiddleware,
    submissionQueueController.getSubmissionQueue
);

module.exports = router;