const submissionService =
    require("../service/facultysubmission_service");

const createSubmission = async (req, res) => {

    try {

        const result =
            await submissionService.createSubmission(
                req.user.user_id,
                req.body,
                req.file
            );

        res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    createSubmission
};