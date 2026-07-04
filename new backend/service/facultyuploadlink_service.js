// services/facultyService.js

const facultyRepository = require("../repository/facultyuploadlink_repo");

const updateSocialLinks = async (userId, socialLinks) => {
    return await facultyRepository.updateSocialLinks(
        userId,
        socialLinks
    );
};

module.exports = {
    updateSocialLinks
};