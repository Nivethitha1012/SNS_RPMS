// controllers/facultyController.js

const facultyService = require("../service/facultyuploadlink_service");

const updateSocialLinks = async (req, res) => {
    try {
        const result = await facultyService.updateSocialLinks(
            req.user.user_id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Social links updated successfully",
            data: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    updateSocialLinks
};