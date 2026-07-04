const submissionQueueService = require("../service/adminsubmissionqueue_service");

const getSubmissionQueue = async (req, res) => {
    try {

        const result =
            await submissionQueueService.getSubmissionQueue();

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

module.exports = {
    getSubmissionQueue
};