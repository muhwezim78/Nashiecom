// Chat Controller for Nashiecom Technologies
const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");

// @desc    Get messages for an order
// @route   GET /api/chat/:orderId
// @access  Private
exports.getOrderMessages = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Check authorization
    if (
      order.userId !== req.user.id &&
      !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)
    ) {
      return next(new AppError("Not authorized to view this chat", 403));
    }

    const messages = await prisma.chatMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/chat/:orderId
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { content, imageUrl, location } = req.body;
    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(req.user.role);

    // Debugging Prisma models if it fails
    if (!prisma.chatMessage) {
      console.error(
        "Available Prisma models:",
        Object.keys(prisma).filter((k) => !k.startsWith("_"))
      );
      return next(
        new AppError(
          "Chat service temporarily unavailable (Database sync issue)",
          500
        )
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return next(new AppError("Order not found", 404));
    }

    // Check authorization
    if (order.userId !== req.user.id && !isAdmin) {
      return next(
        new AppError("Not authorized to send messages in this chat", 403)
      );
    }

    const message = await prisma.chatMessage.create({
      data: {
        orderId,
        senderId: req.user.id,
        content,
        imageUrl,
        location,
        isAdmin,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { message },
    });

    // --- Notification Logic ---
    const io = req.app.get("io");

    // Create persistent notification in database
    const notificationTitle = isAdmin
      ? `Reply on Order #${order.orderNumber}`
      : `New message on Order #${order.orderNumber}`;
    const notificationMessage = content || "Sent an image";

    try {
      if (isAdmin) {
        // Admin sent message -> Create notification for customer
        await prisma.notification.create({
          data: {
            title: notificationTitle,
            message: `${req.user.firstName}: ${notificationMessage}`,
            type: "INFO",
            isGlobal: false,
            userId: order.userId,
            orderId: order.id,
            sentAt: new Date(),
            createdBy: req.user.id,
          },
        });
      } else {
        // Customer sent message -> Create notification for admins (global admin notification)
        await prisma.notification.create({
          data: {
            title: notificationTitle,
            message: `${req.user.firstName}: ${notificationMessage}`,
            type: "INFO",
            isGlobal: true, // Targeted at ALL admins.
            productId: "ADMIN_ONLY", // Target only admins
            // SAFETY: Regular users won't see this because getUserNotifications filters out
            // global notifications that have an orderId (unless it's their own).
            orderId: order.id,
            sentAt: new Date(),
            createdBy: req.user.id,
          },
        });
      }
    } catch (notifError) {
      console.error("Failed to create chat notification:", notifError);
      // Don't fail the request if notification creation fails
    }

    if (io) {
      const notificationData = {
        orderId,
        orderNumber: order.orderNumber,
        senderName: req.user.firstName,
        content: content || "Sent an image",
      };

      if (isAdmin) {
        // Admin sent message -> Notify Client
        io.to(`user_${order.userId}`).emit(
          "new_message_notification",
          notificationData
        );
        io.to(`user_${order.userId}`).emit("new_notification", {
          title: notificationTitle,
          message: `${req.user.firstName}: ${notificationMessage}`,
          type: "INFO",
        });
      } else {
        // Client sent message -> Notify Admins
        io.to("admin_notifications").emit(
          "new_message_notification",
          notificationData
        );
        io.to("admin_notifications").emit("new_notification", {
          title: notificationTitle,
          message: `${req.user.firstName}: ${notificationMessage}`,
          type: "INFO",
        });
      }
    }
  } catch (error) {
    next(error);
  }
};
// @desc    Get all active chats (Admin)
// @route   GET /api/chat
// @access  Admin
exports.getAllChats = async (req, res, next) => {
  try {
    // Only fetch orders that have at least one chat message
    const chats = await prisma.order.findMany({
      where: {
        chatMessages: {
          some: {}, // Returns orders that have messages
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        chatMessages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc", // Or sort by latest message time if possible
      },
    });

    // Transform to friendly format
    const chatList = chats
      .map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.user,
        lastMessage: order.chatMessages[0],
        updatedAt: order.chatMessages[0]?.createdAt || order.updatedAt,
      }))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.status(200).json({
      success: true,
      data: { chats: chatList },
    });
  } catch (error) {
    next(error);
  }
};
