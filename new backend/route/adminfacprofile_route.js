const express = require("express");
const router = express.Router();

const authMiddleware =
require("../middleware/authmiddleware");

const facultyProfileController =
require("../controller/adminfacprofile_con");

router.get(
    "/faculty-profiles",
    authMiddleware,
    facultyProfileController.getFacultyProfiles
);

router.get(
    "/faculty-profile/:userId",
    authMiddleware,
    facultyProfileController.getFacultyProfileDetails
);

module.exports = router;