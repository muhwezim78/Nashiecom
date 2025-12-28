// Notification Routes
const express = require("express");
const notificationController = require("../controllers/notification.controller");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();

// User routes
router.get("/", authenticate, notificationController.getUserNotifications);
router.get(
  "/unread-count",
  authenticate,
  notificationController.getUnreadCount
);
router.patch("/:id/read", authenticate, notificationController.markAsRead);
router.patch("/read-all", authenticate, notificationController.markAllAsRead);

// Admin routes
router.get(
  "/admin",
  authenticate,
  adminOnly,
  notificationController.getAllNotifications
);
router.post(
  "/",
  authenticate,
  adminOnly,
  notificationController.createNotification
);
router.put(
  "/:id",
  authenticate,
  adminOnly,
  notificationController.updateNotification
);
router.delete(
  "/:id",
  authenticate,
  adminOnly,
  notificationController.deleteNotification
);
router.post(
  "/:id/send",
  authenticate,
  adminOnly,
  notificationController.sendNotificationNow
);

module.exports = router;
