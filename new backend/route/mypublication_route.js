const express = require("express");
const router = express.Router();

const authMiddleware =
    require("../middleware/authmiddleware");

const myPublicationController =
    require("../controller/mypublication_con");

router.get(
    "/my-publications",
    authMiddleware,
    myPublicationController.getMyPublications
);

router.get(
    "/my-publications/:customPublicationId",
    authMiddleware,
    myPublicationController.getPublicationDetails
);

module.exports = router;