// services/facultyService.js

const facultyRepository = require("../repository/facultyprofile_repo");

const getFacultyProfile = async (userId) => {
    return await facultyRepository.getFacultyProfile(userId);
};

module.exports = {
    getFacultyProfile
};