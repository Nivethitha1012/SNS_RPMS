const pool = require("../db");

const getFacultyList = async () => {

    const result = await pool.query(
        `
        SELECT
            user_id,
            name,
            department,
            institution_name,
            email,
            temp_admin
        FROM users
        WHERE admin = FALSE
        ORDER BY name ASC
        `
    );

    return result.rows;
};

const grantAccess = async (
    adminId,
    data
) => {

    await pool.query(
        `
        UPDATE users
        SET
            temp_admin = TRUE
        WHERE user_id = $1
        `,
        [data.user_id]
    );

    const existing = await pool.query(
        `
        SELECT *
        FROM temp_admin_permissions
        WHERE user_id = $1
        `,
        [data.user_id]
    );

    if (existing.rows.length > 0) {

        await pool.query(
            `
            UPDATE temp_admin_permissions
            SET
                dashboard = $1,
                evaluation_console = $2,
                my_publications = $3,
                submissions_queue = $4,
                upload_manuscript = $5,
                assign_access = $6,
                evaluate_manuscript = $7,
                export_data = $8,
                delete_manuscript = $9,
                manage_users = $10,
                assigned_by = $11,
                assigned_at = CURRENT_TIMESTAMP
            WHERE user_id = $12
            `,
            [
                data.dashboard,
                data.evaluation_console,
                data.my_publications,
                data.submissions_queue,
                data.upload_manuscript,
                data.assign_access,
                data.evaluate_manuscript,
                data.export_data,
                data.delete_manuscript,
                data.manage_users,
                adminId,
                data.user_id
            ]
        );

    } else {

        await pool.query(
            `
            INSERT INTO temp_admin_permissions
            (
                user_id,
                dashboard,
                evaluation_console,
                my_publications,
                submissions_queue,
                upload_manuscript,
                assign_access,
                evaluate_manuscript,
                export_data,
                delete_manuscript,
                manage_users,
                assigned_by
            )
            VALUES
            (
                $1,$2,$3,$4,$5,
                $6,$7,$8,$9,$10,
                $11,$12
            )
            `,
            [
                data.user_id,
                data.dashboard,
                data.evaluation_console,
                data.my_publications,
                data.submissions_queue,
                data.upload_manuscript,
                data.assign_access,
                data.evaluate_manuscript,
                data.export_data,
                data.delete_manuscript,
                data.manage_users,
                adminId
            ]
        );

    }

    return {
        user_id: data.user_id,
        temp_admin: true
    };
};

const getPermissions = async (
    userId
) => {

    const result = await pool.query(
        `
        SELECT *
        FROM temp_admin_permissions
        WHERE user_id = $1
        `,
        [userId]
    );

    return result.rows[0];
};

const revokeAccess = async (
    userId
) => {

    await pool.query(
        `
        UPDATE users
        SET temp_admin = FALSE
        WHERE user_id = $1
        `,
        [userId]
    );

    await pool.query(
        `
        DELETE FROM temp_admin_permissions
        WHERE user_id = $1
        `,
        [userId]
    );

    return true;
};

module.exports = {
    getFacultyList,
    grantAccess,
    getPermissions,
    revokeAccess
};