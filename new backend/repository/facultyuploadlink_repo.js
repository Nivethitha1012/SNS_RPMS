// repositories/facultyRepository.js

const pool = require("../db");

const updateSocialLinks = async (userId, socialLinks) => {

    await pool.query(
        `DELETE FROM user_social_links WHERE user_id = $1`,
        [userId]
    );

    for (const link of socialLinks) {

        await pool.query(
            `
            INSERT INTO user_social_links
            (
                user_id,
                social_media_name,
                social_media_link
            )
            VALUES ($1,$2,$3)
            `,
            [
                userId,
                link.social_media_name,
                link.social_media_link
            ]
        );
    }

    return socialLinks;
};

module.exports = {
    updateSocialLinks
};