// routes/adminSocialMediaRoutes.js

const express = require("express");
const router = express.Router();

const adminSocialMediaController = require("../controller/adminsocialmediamanagement_con");

router.get(
    "/",
    adminSocialMediaController.getAllSocialMedia
);

router.post(
    "/",
    adminSocialMediaController.createSocialMedia
);

router.put(
    "/:id",
    adminSocialMediaController.updateSocialMedia
);

router.delete(
    "/:id",
    adminSocialMediaController.deleteSocialMedia
);

module.exports = router;