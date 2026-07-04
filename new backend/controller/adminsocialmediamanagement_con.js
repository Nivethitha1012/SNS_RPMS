

const adminSocialMediaService =
    require("../service/adminsocialmediamanagement_service");

const getAllSocialMedia = async (req, res) => {
    try {

        const data =
            await adminSocialMediaService.getAllSocialMedia();

        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const createSocialMedia = async (req, res) => {
    try {

        const result =
            await adminSocialMediaService.createSocialMedia(
                req.body
            );

        res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const updateSocialMedia = async (req, res) => {
    try {

        const result =
            await adminSocialMediaService.updateSocialMedia(
                req.params.id,
                req.body
            );

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const deleteSocialMedia = async (req, res) => {
    try {

        await adminSocialMediaService.deleteSocialMedia(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getAllSocialMedia,
    createSocialMedia,
    updateSocialMedia,
    deleteSocialMedia
};