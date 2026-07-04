const pool = require("../db");

const {
    PutObjectCommand
} = require("@aws-sdk/client-s3");
const institutionMap = {
    "1": "SNSCT",
    "2": "SNSCE",
    "3": "DRSNSRCAS",
    "4": "SNSCPHS",
    "5": "SNSCAHS",
    "6": "SNSCPHYSIO",
    "7": "DRSNSCEDU",
    "8": "SNSBSPINE",
    "9": "SNSACADEMY",
    "10": "SNSCNURSING"
};
const s3 = require("../aws");

const generatePublicationId = async (
    userId,
    institutionId
) => {

    const institutionCode =
        institutionMap[institutionId] || "SNS";

    const totalSubmissions = await pool.query(
        `
        SELECT COUNT(*) total
        FROM submissions
        `
    );

    const institutionSubmissions = await pool.query(
        `
        SELECT COUNT(*) total
        FROM submissions s
        JOIN users u
        ON s.user_id = u.user_id
        WHERE u.institution_id = $1
        `,
        [institutionId]
    );

    const facultySubmissions = await pool.query(
        `
        SELECT COUNT(*) total
        FROM submissions
        WHERE user_id = $1
        `,
        [userId]
    );

    const overallCount =
        Number(totalSubmissions.rows[0].total) + 1;

    const institutionCount =
        Number(institutionSubmissions.rows[0].total) + 1;

    const facultyCount =
        Number(facultySubmissions.rows[0].total) + 1;

    return `${institutionCode}-${overallCount}-${institutionCount}-${facultyCount}`;
};

const createSubmission = async (
    userId,
    data,
    file
) => {

    if (!file) {
        throw new Error("PDF file is required");
    }

    const userResult = await pool.query(
        `
        SELECT
            department,
            institution_id
        FROM users
        WHERE user_id = $1
        `,
        [userId]
    );

    if (userResult.rows.length === 0) {
        throw new Error("User not found");
    }

    const user = userResult.rows[0];

    const duplicateCheck = await pool.query(
        `
        SELECT custom_publication_id
        FROM submissions
        WHERE LOWER(title) = LOWER($1)
        `,
        [data.title]
    );

    const isDuplicate =
        duplicateCheck.rows.length > 0;

    const duplicateOf =
        isDuplicate
            ? duplicateCheck.rows[0].custom_publication_id
            : null;

    const publicationId =
        await generatePublicationId(
            userId,
            user.institution_id
        );

    const key =
        `manuscripts/${Date.now()}-${file.originalname}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        })
    );

    const pdfUrl =
        `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const result = await pool.query(
        `
        INSERT INTO submissions
        (
            custom_publication_id,
            user_id,
            department,
            title,
            category_id,
            manuscript_pdf_url,
            is_duplicate,
            duplicate_of,
            status
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        RETURNING *
        `,
        [
            publicationId,
            userId,
            user.department,
            data.title,
            data.category_id,
            pdfUrl,
            isDuplicate,
            duplicateOf,
            "Pending"
        ]
    );

    return result.rows[0];
};
module.exports = {
    createSubmission
};