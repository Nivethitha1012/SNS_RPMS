// services/adminService.js

const adminRepository = require("../repository/adminprofile_repo.js");

const getAdminProfile = async (userId) => {
    return await adminRepository.getAdminProfile(userId);
};

module.exports = {
    getAdminProfile
};