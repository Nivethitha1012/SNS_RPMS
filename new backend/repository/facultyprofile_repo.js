// repositories/facultyRepository.js

const pool = require("../db");

const getFacultyProfile = async (userId) => {

    const userResult = await pool.query(
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

    if (userResult.rows.length === 0) {
        return null;
    }

    const socialResult = await pool.query(
        `
        SELECT
            sm.social_media_name,
            usl.social_media_link
        FROM social_media_master sm
        LEFT JOIN user_social_links usl
            ON sm.social_media_name = usl.social_media_name
            AND usl.user_id = $1
        WHERE sm.is_enabled = TRUE
        ORDER BY sm.social_media_name
        `,
        [userId]
    );

    return {
        ...userResult.rows[0],
        social_links: socialResult.rows
    };
};

module.exports = {
    getFacultyProfile
};