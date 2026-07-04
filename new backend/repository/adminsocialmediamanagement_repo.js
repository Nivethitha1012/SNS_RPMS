// repositories/adminSocialMediaRepository.js

const pool = require("../db");

const getAllSocialMedia = async () => {

    const result = await pool.query(
        `
        SELECT *
        FROM social_media_master
        ORDER BY social_media_name
        `
    );

    return result.rows;
};

const createSocialMedia = async (body) => {

    const { social_media_name } = body;

    const result = await pool.query(
        `
        INSERT INTO social_media_master
        (
            social_media_name
        )
        VALUES ($1)
        RETURNING *
        `,
        [social_media_name]
    );

    return result.rows[0];
};

const updateSocialMedia = async (id, body) => {

    const { is_enabled } = body;

    const result = await pool.query(
        `
        UPDATE social_media_master
        SET is_enabled = $1
        WHERE id = $2
        RETURNING *
        `,
        [is_enabled, id]
    );

    return result.rows[0];
};

const deleteSocialMedia = async (id) => {

    await pool.query(
        `
        DELETE FROM social_media_master
        WHERE id = $1
        `,
        [id]
    );
};

module.exports = {
    getAllSocialMedia,
    createSocialMedia,
    updateSocialMedia,
    deleteSocialMedia
};