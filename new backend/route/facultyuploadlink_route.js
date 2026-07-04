// routes/facultyuploadlink_route.js

const express = require("express");
const router = express.Router();
const facultyController = require("../controller/facultyuploadlink_con");
const authMiddleware = require("../middleware/authmiddleware.js");

router.put(
    "/profile/social-links",
    authMiddleware,
    facultyController.updateSocialLinks
);

module.exports = router;