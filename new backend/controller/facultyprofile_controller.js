// controllers/facultyController.js

const facultyService = require("../service/facultyprofile_service");

const getFacultyProfile = async (req, res) => {
    try {
        const profile = await facultyService.getFacultyProfile(
            req.user.user_id
        );

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getFacultyProfile
};