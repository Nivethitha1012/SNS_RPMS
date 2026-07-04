// controllers/adminController.js

const adminService = require("../service/adminprofile_service");

const getAdminProfile = async (req, res) => {
    try {
        const profile = await adminService.getAdminProfile(
            req.user.user_id
        );

        res.status(200).json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAdminProfile
};