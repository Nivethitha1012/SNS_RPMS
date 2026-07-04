const submissionRepository =
    require("../repository/facultysubmission_repo");

const createSubmission = async (
    userId,
    data,
    file
) => {

    return await submissionRepository.createSubmission(
        userId,
        data,
        file
    );

};

module.exports = {
    createSubmission
};