const myPublicationRepository =
    require("../repository/mypublication_repo");

const getMyPublications = async (
    user
) => {

    return await myPublicationRepository
        .getMyPublications(
            user
        );

};

const getPublicationDetails = async (
    customPublicationId
) => {

    return await myPublicationRepository
        .getPublicationDetails(
            customPublicationId
        );

};

module.exports = {
    getMyPublications,
    getPublicationDetails
};