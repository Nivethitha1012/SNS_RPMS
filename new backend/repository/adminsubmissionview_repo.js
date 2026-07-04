const pool = require("../db");
const mailService = require("../service/mailservice");
const {
    PutObjectCommand
} = require("@aws-sdk/client-s3");

const s3 = require("../aws");

const getSubmissionDetails = async (
    customPublicationId
) => {

    const result = await pool.query(
        `
        SELECT
            s.custom_publication_id,
            s.title,
            u.name,
            u.email,
            u.department,
            u.institution_name,
            s.manuscript_pdf_url,
            s.review_pdf_url,
            s.status,
            s.submission_date
        FROM submissions s

        JOIN users u
        ON s.user_id = u.user_id

        WHERE s.custom_publication_id = $1
        `,
        [customPublicationId]
    );
    
    

    if (result.rows.length === 0) {
        throw new Error("Submission not found");
    }

    return result.rows[0];
};

const uploadReview = async (
    customPublicationId,
    file
) => {

    if (!file) {
        throw new Error(
            "Review PDF is required"
        );
    }

    const key =
        `reviews/${Date.now()}-${file.originalname}`;

    await s3.send(
        new PutObjectCommand({
            Bucket:
                process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        })
    );

    const reviewPdfUrl =
        `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const result = await pool.query(
        `
        UPDATE submissions
        SET
            review_pdf_url = $1,
            status = 'Completed',
            updated_at = CURRENT_TIMESTAMP
        WHERE custom_publication_id = $2
        RETURNING *
        `,
        [
            reviewPdfUrl,
            customPublicationId
        ]
    );
    const faculty = await pool.query(
        `
        SELECT
            u.name,
            u.email,
            s.title
        FROM submissions s

        JOIN users u
        ON s.user_id = u.user_id

        WHERE s.custom_publication_id = $1
        `,
        [customPublicationId]
);

await mailService.sendFacultyReviewMail(
    faculty.rows[0].email,
    faculty.rows[0].name,
    faculty.rows[0].title,
    customPublicationId
);
    if (result.rows.length === 0) {
        throw new Error(
            "Submission not found"
        );
    }

    return result.rows[0];
};

module.exports = {
    getSubmissionDetails,
    uploadReview
};