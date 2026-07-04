const dashboardService =
    require("../service/admindashboard_service");

const getDashboard = async (
    req,
    res
) => {

    try {

        const institutionId =
            req.query.institutionId || null;

        const result =
            await dashboardService.getDashboard(
                institutionId
            );

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
const exportDashboardData = async (req, res) => {

    try {

        const institutionId =
            req.query.institutionId || null;

        const result =
            await dashboardService
                .exportDashboardData(
                    institutionId
                );

        return res.status(200).json({
            success: true,
            downloadUrl: result.downloadUrl
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getDashboard,
    exportDashboardData
};