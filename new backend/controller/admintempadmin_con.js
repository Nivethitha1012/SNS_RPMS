const tempAdminService = require("../service/admintempadmin_service");

const getFacultyList = async (req, res) => {
    try {

        const result =
            await tempAdminService.getFacultyList();

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const grantAccess = async (req, res) => {

    try {

        const result =
            await tempAdminService.grantAccess(
                req.user.user_id,
                req.body
            );

        return res.status(200).json({
            success: true,
            message: "Access Granted Successfully",
            data: result
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getPermissions = async (req, res) => {

    try {

        const { userId } = req.params;

        const result =
            await tempAdminService.getPermissions(
                userId
            );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const revokeAccess = async (req, res) => {

    try {

        const { userId } = req.params;

        await tempAdminService.revokeAccess(
            userId
        );

        return res.status(200).json({
            success: true,
            message: "Temp Admin Access Removed"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getFacultyList,
    grantAccess,
    getPermissions,
    revokeAccess
};