const notificationService =
require("../service/notify_service");

const getAdminNotificationCount =
async (req,res)=>{

    try{

        const result =
        await notificationService
        .getAdminNotificationCount(
            req.user.user_id
        );

        return res.status(200).json({
            success:true,
            count:result
        });

    }catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

const getFacultyNotifications =
async (req,res)=>{

    try{

        const result =
        await notificationService
        .getFacultyNotifications(
            req.user.user_id
        );

        return res.status(200).json({
            success:true,
            data:result
        });

    }catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

const markAsRead =
async (req,res)=>{

    try{

        const { notificationId } =
        req.params;

        await notificationService
        .markAsRead(
            notificationId
        );

        return res.status(200).json({
            success:true,
            message:"Notification marked as read"
        });

    }catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

module.exports = {
    getAdminNotificationCount,
    getFacultyNotifications,
    markAsRead
};