const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authmiddleware");

const tempAdminController = require("../controller/admintempadmin_con");

router.get(
    "/faculties",
    authMiddleware,
    tempAdminController.getFacultyList
);

router.post(
    "/grant-access",
    authMiddleware,
    tempAdminController.grantAccess
);

router.get(
    "/permissions/:userId",
    authMiddleware,
    tempAdminController.getPermissions
);

router.delete(
    "/revoke-access/:userId",
    authMiddleware,
    tempAdminController.revokeAccess
);

module.exports = router;