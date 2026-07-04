const myPublicationService =
require("../service/mypublication_service");

const getMyPublications = async (
    req,
    res
) => {

    try {

        const result =
            await myPublicationService
            .getMyPublications(
                req.user
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

const getPublicationDetails = async (
    req,
    res
) => {

    try {

        const {
            customPublicationId
        } = req.params;

        const result =
            await myPublicationService
            .getPublicationDetails(
                customPublicationId
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
    getMyPublications,
    getPublicationDetails
};