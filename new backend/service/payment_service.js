const paymentRepository =
    require("../repository/payment_repo");

const createOrder = async (
    custom_publication_id
) => {

    return await paymentRepository.createOrder(
        custom_publication_id
    );

};

module.exports = {
    createOrder
};