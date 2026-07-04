const submissionReviewService =
    require("../service/adminsubmissionview_service");

const getSubmissionDetails = async (req, res) => {
    try {

        const { customPublicationId } = req.params;

        const result =
            await submissionReviewService.getSubmissionDetails(
                customPublicationId
            );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const uploadReview = async (req, res) => {

    try {

        const { customPublicationId } = req.params;

        const result =
            await submissionReviewService.uploadReview(
                customPublicationId,
                req.file
            );

        return res.status(200).json({
            success: true,
            message: "Review uploaded successfully",
            data: result
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getSubmissionDetails,
    uploadReview
};