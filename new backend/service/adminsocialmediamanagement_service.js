
const adminSocialMediaRepository =
    require("../repository/adminsocialmediamanagement_repo");

const getAllSocialMedia = async () => {
    return await adminSocialMediaRepository.getAllSocialMedia();
};

const createSocialMedia = async (body) => {
    return await adminSocialMediaRepository.createSocialMedia(body);
};

const updateSocialMedia = async (id, body) => {
    return await adminSocialMediaRepository.updateSocialMedia(
        id,
        body
    );
};

const deleteSocialMedia = async (id) => {
    return await adminSocialMediaRepository.deleteSocialMedia(id);
};

module.exports = {
    getAllSocialMedia,
    createSocialMedia,
    updateSocialMedia,
    deleteSocialMedia
};