const pool = require("../db");

const getAdminNotificationCount =
async(userId)=>{

    const result =
    await pool.query(
    `
    SELECT
        COUNT(*) total
    FROM notifications
    WHERE
        user_id = $1
    AND
        is_read = FALSE
    `,
    [userId]
    );

    return Number(
        result.rows[0].total
    );

};

const getFacultyNotifications =
async(userId)=>{

    const result =
    await pool.query(
    `
    SELECT

        notification_id,

        title,

        message,

        is_read,

        created_at

    FROM notifications

    WHERE
        user_id = $1

    ORDER BY
        created_at DESC
    `,
    [userId]
    );

    return result.rows;
};

const markAsRead =
async(notificationId)=>{

    await pool.query(
    `
    UPDATE notifications
    SET is_read = TRUE
    WHERE notification_id = $1
    `,
    [notificationId]
    );

    return true;
};

const createNotification =
async(
    userId,
    title,
    message,
    type,
    referenceId = null
)=>{

    await pool.query(
    `
    INSERT INTO notifications
    (
        user_id,
        title,
        message,
        type,
        reference_id
    )
    VALUES
    (
        $1,$2,$3,$4,$5
    )
    `,
    [
        userId,
        title,
        message,
        type,
        referenceId
    ]
    );

};

module.exports = {
    getAdminNotificationCount,
    getFacultyNotifications,
    markAsRead,
    createNotification
};