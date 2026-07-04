const paymentService =
    require("../service/payment_service");

const createOrder = async (
    req,
    res
) => {

    try {

        const {
            custom_publication_id
        } = req.params;

        const result =
            await paymentService.createOrder(
                custom_publication_id
            );

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    createOrder
};