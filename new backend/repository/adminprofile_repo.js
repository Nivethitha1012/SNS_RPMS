// repositories/adminRepository.js

const pool = require("../db");

const getAdminProfile = async (userId) => {

    const result = await pool.query(
        `
        SELECT
            user_id,
            name,
            institution_name,
            phone_number,
            role,
            email
        FROM users
        WHERE user_id = $1
        `,
        [userId]
    );

    return result.rows[0];
};

module.exports = {
    getAdminProfile
};