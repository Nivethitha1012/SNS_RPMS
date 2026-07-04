const pool = require("../db");

const createCategory = async (data) => {

    const result = await pool.query(
        `
        INSERT INTO categories
        (
            category_name,
            fees
        )
        VALUES ($1,$2)
        RETURNING *
        `,
        [
            data.category_name,
            data.fees
        ]
    );

    return result.rows[0];
};

const getCategories = async () => {

    const result = await pool.query(
        `
        SELECT *
        FROM categories
        ORDER BY category_name ASC
        `
    );

    return result.rows;
};

const updateCategory = async (
    categoryId,
    data
) => {

    const result = await pool.query(
        `
        UPDATE categories
        SET
            category_name = $1,
            fees = $2
        WHERE category_id = $3
        RETURNING *
        `,
        [
            data.category_name,
            data.fees,
            categoryId
        ]
    );

    return result.rows[0];
};

const deleteCategory = async (
    categoryId
) => {

    const check = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM submissions
        WHERE category_id = $1
        `,
        [categoryId]
    );

    if (Number(check.rows[0].total) > 0) {
        throw new Error(
            "Category is already used by publications"
        );
    }

    await pool.query(
        `
        DELETE FROM categories
        WHERE category_id = $1
        `,
        [categoryId]
    );

    return true;
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};