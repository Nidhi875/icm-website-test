const pool = require("../config/db");

// Get all notifications
const getNotifications = async () => {
    const result = await pool.query(`
        SELECT *
        FROM notifications
        ORDER BY created_at DESC
    `);

    console.log(result.rows);   // <-- Add ONLY this line

    return result.rows;
};

// Create notification
const createNotification = async (
    title,
    message,
    type,
    link,
    user_id = null
) => {

    const result = await pool.query(
        `INSERT INTO notifications
        (user_id, title, message, type, link)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *`,
        [user_id, title, message, type, link]
    );

    return result.rows[0];
};

// Mark notification as read
const markAsRead = async (id) => {

    const result = await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE id=$1
         RETURNING *`,
        [id]
    );

    return result.rows[0];
};

// Delete notification
const deleteNotification = async (id) => {

    await pool.query(
        `DELETE FROM notifications
         WHERE id=$1`,
        [id]
    );
};

module.exports = {
    getNotifications,
    createNotification,
    markAsRead,
    deleteNotification
};