const express = require("express");
const router = express.Router();

const authMiddleware =
    require("../middleware/authmiddleware.js");

const paymentController =
    require("../controller/payment_con");

router.post(
    "/create-order/:custom_publication_id",
    authMiddleware,
    paymentController.createOrder
);

module.exports = router;