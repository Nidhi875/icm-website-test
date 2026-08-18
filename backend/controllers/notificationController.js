const notificationModel = require("../models/notificationModel");

// GET all notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await notificationModel.getNotifications();

        res.json({
            success: true,
            notifications
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load notifications"
        });
    }
};

// CREATE notification
exports.createNotification = async (req, res) => {

    try {

        const {
            title,
            message,
            type,
            link,
            user_id
        } = req.body;

        const notification =
            await notificationModel.createNotification(
                title,
                message,
                type,
                link,
                user_id
            );

        res.status(201).json({
            success: true,
            notification
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create notification"
        });
    }
};

// MARK AS READ
exports.markAsRead = async (req, res) => {

    try {

        const notification =
            await notificationModel.markAsRead(req.params.id);

        res.json({
            success: true,
            notification
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update notification"
        });
    }
};

// DELETE
exports.deleteNotification = async (req, res) => {

    try {

        await notificationModel.deleteNotification(req.params.id);

        res.json({
            success: true,
            message: "Notification deleted"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete notification"
        });
    }
};