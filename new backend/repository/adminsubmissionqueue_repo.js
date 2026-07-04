const pool = require("../db");

const getSubmissionQueue = async () => {

    const result = await pool.query(
        `
        SELECT

            ROW_NUMBER()
            OVER (
                ORDER BY s.submission_date ASC
            ) AS sno,

            s.custom_publication_id,

            s.title,

            c.category_name,

            u.institution_name,

            s.submission_date AS uploaded_date,

            s.status,

            CASE
                WHEN s.status IN
                (
                    'Approved',
                    'Reviewed'
                )
                THEN s.updated_at
                ELSE NULL
            END AS reviewed_date

        FROM submissions s

        JOIN users u
            ON s.user_id = u.user_id

        JOIN categories c
            ON s.category_id = c.category_id

        ORDER BY s.submission_date DESC
        `
    );

    return result.rows;
};

module.exports = {
    getSubmissionQueue
};