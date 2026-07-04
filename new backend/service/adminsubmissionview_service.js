const submissionReviewRepository =
    require("../repository/adminsubmissionview_repo");

const getSubmissionDetails = async (
    customPublicationId
) => {

    return await submissionReviewRepository
        .getSubmissionDetails(
            customPublicationId
        );

};

const uploadReview = async (
    customPublicationId,
    file
) => {

    return await submissionReviewRepository
        .uploadReview(
            customPublicationId,
            file
        );

};

module.exports = {
    getSubmissionDetails,
    uploadReview
};