// services/authService.js

const axios = require("axios");
const jwt = require("jsonwebtoken");
const authRepository = require("../repository/auth_repo");

const ssoLogin = async (payload) => {

    const ssoResponse = await axios.post(
        process.env.SSO_URL,
        payload
    );

    if (!ssoResponse.data.success) {
        throw new Error("SSO Authentication Failed");
    }

    const user = ssoResponse.data.user;

    let dbUser = await authRepository.findUser(user.userId.toString());

    if (!dbUser) {
        dbUser = await authRepository.createUser(user);
    }

    const token = jwt.sign(
        {
            user_id: dbUser.user_id,
            role: dbUser.role,
            email: dbUser.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        success: true,
        token,
        user: dbUser
    };
};

module.exports = {
    ssoLogin
};