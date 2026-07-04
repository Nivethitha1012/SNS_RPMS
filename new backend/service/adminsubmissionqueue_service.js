const submissionQueueRepository =
    require("../repository/adminsubmissionqueue_repo");

const getSubmissionQueue = async () => {

    return await submissionQueueRepository.getSubmissionQueue();

};

module.exports = {
    getSubmissionQueue
};