const pool = require("../db");

const getFacultyProfiles = async (
    institutionId
) => {

    let filter = "";
    let params = [];

    if(institutionId){

        filter =
        `
        WHERE u.institution_id = $1
        `;

        params.push(institutionId);
    }

    const result = await pool.query(
        `
        SELECT

            ROW_NUMBER()
            OVER(
                ORDER BY u.name
            ) AS sno,

            u.user_id,

            u.name,

            u.institution_name,

            COUNT(
                CASE
                    WHEN s.is_duplicate = FALSE
                    THEN 1
                END
            ) AS publication_count

        FROM users u

        LEFT JOIN submissions s
        ON u.user_id =
        s.user_id

        ${filter}

        GROUP BY
            u.user_id,
            u.name,
            u.institution_name

        ORDER BY
            u.name
        `,
        params
    );

    return result.rows;
};
const getFacultyProfileDetails = async (
    userId
) => {

    const profile =
    await pool.query(
    `
    SELECT

        user_id,
        name,
        email,
        role,
        department,
        phone_number,
        institution_name,
        institution_id

    FROM users

    WHERE user_id = $1
    `,
    [userId]
    );

    if(profile.rows.length === 0){

        throw new Error(
            "Faculty not found"
        );
    }

    const socialLinks =
    await pool.query(
    `
    SELECT
        social_media_name,
        social_media_link
    FROM user_social_links
    WHERE user_id = $1
    `,
    [userId]
    );

    const publications =
    await pool.query(
    `
    SELECT
        custom_publication_id,
        title,
        status,
        submission_date
    FROM submissions
    WHERE user_id = $1
    ORDER BY submission_date DESC
    `,
    [userId]
    );

    return {

        profile:
            profile.rows[0],

        socialLinks:
            socialLinks.rows,

        publications:
            publications.rows

    };
};

module.exports = {
    getFacultyProfiles,
    getFacultyProfileDetails
};