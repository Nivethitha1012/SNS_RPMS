const dashboardRepository =
    require("../repository/admindashboard_repo");

const getDashboard = async (
    institutionId
) => {

    return await dashboardRepository
        .getDashboard(
            institutionId
        );

};

const exportDashboardData = async (
    institutionId
) => {

    return await dashboardRepository
        .exportDashboardData(
            institutionId
        );

};

module.exports = {
    getDashboard,
    exportDashboardData
};