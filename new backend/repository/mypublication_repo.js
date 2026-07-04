const pool = require("../db");

const getMyPublications = async (
    user
) => {

    let query = `
    SELECT

        ROW_NUMBER()
        OVER(
            ORDER BY s.submission_date ASC
        ) AS sno,

        s.custom_publication_id,

        s.title,

        s.submission_date
        AS uploaded_date,

        s.status,

        CASE
            WHEN s.status='Completed'
            THEN s.updated_at
            ELSE NULL
        END
        AS reviewed_date

    FROM submissions s
    `;

    let params = [];

    if(
        !user.admin &&
        !user.temp_admin
    ){

        query += `
        WHERE s.user_id = $1
        `;

        params.push(
            user.user_id
        );
    }

    query += `
    ORDER BY
    s.submission_date DESC
    `;

    const result =
    await pool.query(
        query,
        params
    );

    return result.rows;
};

const getPublicationDetails = async (
    customPublicationId
) => {

    const result =
    await pool.query(
    `
    SELECT

        custom_publication_id,

        title,

        status,

        manuscript_pdf_url,

        review_pdf_url,

        submission_date,

        updated_at

    FROM submissions

    WHERE custom_publication_id = $1
    `,
    [customPublicationId]
    );

    if(result.rows.length===0){

        throw new Error(
            "Publication not found"
        );
    }

    const publication =
        result.rows[0];

    return {

        custom_publication_id:
            publication.custom_publication_id,

        title:
            publication.title,

        status:
            publication.status,

        manuscript_pdf_url:
            publication.manuscript_pdf_url,

        review_pdf_url:
            publication.status ===
            "Completed"
            ? publication.review_pdf_url
            : null,

        uploaded_date:
            publication.submission_date,

        reviewed_date:
            publication.status ===
            "Completed"
            ? publication.updated_at
            : null

    };
};

module.exports = {
    getMyPublications,
    getPublicationDetails
};