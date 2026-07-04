// controllers/authController.js

const authService = require("../service/auth_service.js");

const ssoLogin = async (req, res) => {
    try {
        const result = await authService.ssoLogin(req.body);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    ssoLogin
};