const express = require("express");
const router = express.Router();

const authMiddleware =
    require("../middleware/authmiddleware");

const notificationController =
    require("../controller/notify_con");

router.get(
    "/admin/count",
    authMiddleware,
    notificationController.getAdminNotificationCount
);

router.get(
    "/faculty",
    authMiddleware,
    notificationController.getFacultyNotifications
);

router.put(
    "/read/:notificationId",
    authMiddleware,
    notificationController.markAsRead
);

module.exports = router;