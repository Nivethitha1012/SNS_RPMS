const transporter =
require("../mailconfig");

const sendFacultyReviewMail = async (
    email,
    facultyName,
    title,
    publicationId
) => {

    await transporter.sendMail({
        from: process.env.MAIL_USER,

        to: email,

        subject:
        `Review Completed - ${publicationId}`,

        html: `
            <h3>Review Completed</h3>

            <p>Dear ${facultyName},</p>

            <p>
            Your publication
            <b>${title}</b>
            has been reviewed.
            </p>

            <p>
            Review PDF is available in RPMS Portal.
            </p>

            <p>
            Publication ID:
            ${publicationId}
            </p>
        `
    });

};

module.exports = {
    sendFacultyReviewMail
};