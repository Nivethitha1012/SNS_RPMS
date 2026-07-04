// repositories/authRepository.js

const pool = require("../db");

const findUser = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE user_id = $1`,
        [userId]
    );

    return result.rows[0];
};

const createUser = async (user) => {

    const result = await pool.query(
        `
        INSERT INTO users (
            user_id,
            name,
            email,
            role,
            department,
            phone_number,
            institution_name,
            institution_id
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
        `,
        [
            user.userId.toString(),
            user.name,
            user.email,
            user.role,
            user.department,
            user.phone,
            user.branch.name,
            user.branch._id.toString()
        ]
    );

    return result.rows[0];
};

module.exports = {
    findUser,
    createUser
};