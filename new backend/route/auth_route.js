// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const authController = require("../controller/authcontroller.js");

router.post("/sso-login", authController.ssoLogin);

module.exports = router;