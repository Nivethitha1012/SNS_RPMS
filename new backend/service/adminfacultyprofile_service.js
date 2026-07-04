const facultyProfileRepository =
require("../repository/adminfacprofile_repo");

const getFacultyProfiles = async (
    institutionId
) => {

    return await facultyProfileRepository
        .getFacultyProfiles(
            institutionId
        );

};

const getFacultyProfileDetails = async (
    userId
) => {

    return await facultyProfileRepository
        .getFacultyProfileDetails(
            userId
        );

};

module.exports = {
    getFacultyProfiles,
    getFacultyProfileDetails
};