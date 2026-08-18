const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");

// Get all notifications
router.get("/", notificationController.getNotifications);

// Create notification
router.post("/", notificationController.createNotification);

// Mark notification as read
router.put("/:id/read", notificationController.markAsRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;