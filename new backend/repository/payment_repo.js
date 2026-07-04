const pool = require("../db");
const razorpay = require("../razorpay");

const createOrder = async (custom_publication_id) => {
    const submission = await pool.query(
        `
        SELECT
            s.publication_id,
            s.custom_publication_id,
            s.category_id,
            c.fees
        FROM submissions s
        LEFT JOIN categories c
        ON s.category_id = c.category_id
        WHERE TRIM(LOWER(s.custom_publication_id))
        = TRIM(LOWER($1))
        `,
        [custom_publication_id]
    );

    if (submission.rows.length === 0) {
        throw new Error("Submission not found");
    }

    const data = submission.rows[0];

    const order = await razorpay.orders.create({
        amount: Number(data.fees) * 100,
        currency: "INR",
        receipt: `PUB_${data.custom_publication_id}`
    });

    await pool.query(
        `
        INSERT INTO payments
        (
            publication_id,
            category_id,
            amount,
            razorpay_order_id,
            payment_status
        )
        VALUES
        (
            $1,$2,$3,$4,'PENDING'
        )
        `,
        [
            data.publication_id,
            data.category_id,
            data.fees,
            order.id
        ]
    );

    return {
        publication_id: data.publication_id,
        custom_publication_id: data.custom_publication_id,
        amount: data.fees,
        order_id: order.id,
        currency: order.currency
    };
};

module.exports = {
    createOrder
};