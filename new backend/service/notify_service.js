const notificationRepository =
require("../repository/notify_repo");

const getAdminNotificationCount =
async(userId)=>{

    return await notificationRepository
    .getAdminNotificationCount(
        userId
    );

};

const getFacultyNotifications =
async(userId)=>{

    return await notificationRepository
    .getFacultyNotifications(
        userId
    );

};

const markAsRead =
async(notificationId)=>{

    return await notificationRepository
    .markAsRead(
        notificationId
    );

};

module.exports = {
    getAdminNotificationCount,
    getFacultyNotifications,
    markAsRead
};