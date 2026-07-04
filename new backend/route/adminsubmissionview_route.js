const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");
const upload = require("../middleware/uploadpdfsoft");

const submissionReviewController =
    require("../controller/adminsubmissionview_con");

router.get(
    "/:customPublicationId",
    authMiddleware,
    submissionReviewController.getSubmissionDetails
);

router.put(
    "/:customPublicationId/review",
    authMiddleware,
    upload.single("reviewPdf"),
    submissionReviewController.uploadReview
);

module.exports = router;