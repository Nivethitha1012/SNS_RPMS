const facultyProfileService =
require("../service/adminfacultyprofile_service");

const getFacultyProfiles = async (
    req,
    res
) => {

    try {

        const institutionId =
            req.query.institutionId || null;

        const result =
            await facultyProfileService
            .getFacultyProfiles(
                institutionId
            );

        return res.status(200).json({
            success:true,
            data:result
        });

    } catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }
};

const getFacultyProfileDetails = async (
    req,
    res
) => {

    try {

        const { userId } =
            req.params;

        const result =
            await facultyProfileService
            .getFacultyProfileDetails(
                userId
            );

        return res.status(200).json({
            success:true,
            data:result
        });

    } catch(error){

        return res.status(500).json({
            success:false,
            message:error.message
        });

    }
};

module.exports = {
    getFacultyProfiles,
    getFacultyProfileDetails
};