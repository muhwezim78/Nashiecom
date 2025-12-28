// Notification Controller
const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole);
    const { page = 1, limit = 20, unreadOnly = "false" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build role-aware where clause
    let notificationWhere;

    if (isAdmin) {
      // Admins see:
      // 1. Notifications specifically for them (userId matches)
      // 2. Global notifications (isGlobal: true)
      // 3. Admin-only targeted notifications (productId: "ADMIN_ONLY")
      notificationWhere = {
        isActive: true,
        AND: [
          {
            OR: [
              { userId: userId }, // Their personal notifications
              { isGlobal: true }, // All global notifications
              { productId: "ADMIN_ONLY" }, // Notifications targeted at admin group
            ],
          },
          {
            OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
          },
        ],
      };
    } else {
      // Customers see:
      // 1. Notifications specifically for them (userId matches)
      // 2. Global notifications that are NOT admin-only
      notificationWhere = {
        isActive: true,
        AND: [
          {
            OR: [
              { userId: userId }, // Their personal notifications
              {
                AND: [
                  { isGlobal: true },
                  { userId: null }, // Global with no specific target
                  // Exclude Admin Only notifications
                  {
                    OR: [
                      { productId: null },
                      { productId: { not: "ADMIN_ONLY" } },
                    ],
                  },
                ],
              },
            ],
          },
          {
            OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
          },
        ],
      };
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: notificationWhere,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: {
          userNotifications: {
            where: { userId },
            select: { isRead: true, readAt: true },
          },
        },
      }),
      prisma.notification.count({ where: notificationWhere }),
    ]);

    // Format notifications with read status
    const formattedNotifications = notifications.map((notif) => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      orderId: notif.orderId,
      productId: notif.productId,
      isRead: notif.userNotifications[0]?.isRead || false,
      readAt: notif.userNotifications[0]?.readAt,
      createdAt: notif.createdAt,
    }));

    // Filter unread if requested
    const finalNotifications =
      unreadOnly === "true"
        ? formattedNotifications.filter((n) => !n.isRead)
        : formattedNotifications;

    res.status(200).json({
      success: true,
      data: {
        notifications: finalNotifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(userRole);

    // Build role-aware where clause (same as getUserNotifications)
    let notificationWhere;

    if (isAdmin) {
      notificationWhere = {
        isActive: true,
        AND: [
          {
            OR: [
              { userId: userId },
              { isGlobal: true },
              { productId: "ADMIN_ONLY" },
            ],
          },
          {
            OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
          },
        ],
      };
    } else {
      notificationWhere = {
        isActive: true,
        AND: [
          {
            OR: [
              { userId: userId },
              {
                AND: [
                  { isGlobal: true },
                  { userId: null },
                  {
                    OR: [
                      { productId: null },
                      { productId: { not: "ADMIN_ONLY" } },
                    ],
                  },
                ],
              },
            ],
          },
          {
            OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
          },
        ],
      };
    }

    const notifications = await prisma.notification.findMany({
      where: notificationWhere,
      select: { id: true },
    });

    // Get read notifications
    const readNotifications = await prisma.userNotification.findMany({
      where: {
        userId,
        isRead: true,
        notificationId: { in: notifications.map((n) => n.id) },
      },
      select: { notificationId: true },
    });

    const unreadCount = notifications.length - readNotifications.length;

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await prisma.userNotification.upsert({
      where: {
        userId_notificationId: { userId, notificationId: id },
      },
      create: {
        userId,
        notificationId: id,
        isRead: true,
        readAt: new Date(),
      },
      update: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all unread notifications for user
    const notifications = await prisma.notification.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [{ userId: userId }, { isGlobal: true }],
          },
        ],
      },
      select: { id: true },
    });

    // Upsert read status for all
    await Promise.all(
      notifications.map((notif) =>
        prisma.userNotification.upsert({
          where: {
            userId_notificationId: { userId, notificationId: notif.id },
          },
          create: {
            userId,
            notificationId: notif.id,
            isRead: true,
            readAt: new Date(),
          },
          update: {
            isRead: true,
            readAt: new Date(),
          },
        })
      )
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// ============== ADMIN ENDPOINTS ==============

// @desc    Get all notifications (Admin)
// @route   GET /api/notifications/admin
// @access  Admin
exports.getAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, isGlobal } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (type) where.type = type;
    if (isGlobal !== undefined) where.isGlobal = isGlobal === "true";

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create notification (Admin)
// @route   POST /api/notifications
// @access  Admin
exports.createNotification = async (req, res, next) => {
  try {
    const {
      title,
      message,
      type = "INFO",
      isGlobal = false,
      userId,
      orderId,
      productId,
      scheduledAt,
    } = req.body;

    if (!title || !message) {
      return next(new AppError("Title and message are required", 400));
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        isGlobal,
        userId,
        orderId,
        productId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        sentAt: scheduledAt ? null : new Date(),
        createdBy: req.user.id,
      },
    });

    // If not scheduled and active, emit via socket
    if (!scheduledAt && notification.isActive) {
      const io = req.app.get("io");
      if (io) {
        if (isGlobal) {
          // Broadcast to all connected users
          io.emit("new_notification", {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
          });
        } else if (userId) {
          // Send to specific user
          io.to(`user_${userId}`).emit("new_notification", {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification (Admin)
// @route   PUT /api/notifications/:id
// @access  Admin
exports.updateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, message, type, isGlobal, isActive, scheduledAt } = req.body;

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        title,
        message,
        type,
        isGlobal,
        isActive,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      },
    });

    res.status(200).json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification (Admin)
// @route   DELETE /api/notifications/:id
// @access  Admin
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.notification.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send notification now (for scheduled ones)
// @route   POST /api/notifications/:id/send
// @access  Admin
exports.sendNotificationNow = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { sentAt: new Date() },
    });

    // Emit via socket
    const io = req.app.get("io");
    if (io && notification.isActive) {
      if (notification.isGlobal) {
        io.emit("new_notification", {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
        });
      } else if (notification.userId) {
        io.to(`user_${notification.userId}`).emit("new_notification", {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Notification sent",
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};
