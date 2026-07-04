const tempAdminRepository =
    require("../repository/admintempadmin_repo");

const getFacultyList = async () => {

    return await tempAdminRepository.getFacultyList();

};

const grantAccess = async (
    adminId,
    data
) => {

    return await tempAdminRepository.grantAccess(
        adminId,
        data
    );

};

const getPermissions = async (
    userId
) => {

    return await tempAdminRepository.getPermissions(
        userId
    );

};

const revokeAccess = async (
    userId
) => {

    return await tempAdminRepository.revokeAccess(
        userId
    );

};

module.exports = {
    getFacultyList,
    grantAccess,
    getPermissions,
    revokeAccess
};