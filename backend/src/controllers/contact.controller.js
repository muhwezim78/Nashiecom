// Contact/Support Controller
const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

// @desc    Create contact message
// @route   POST /api/contact
// @access  Public
exports.createMessage = async (req, res, next) => {
  try {
    const { name, email, subject, inquiryType, message } = req.body;

    const contactMessage = await prisma.contactMessage.create({
      data: {
        userId: req.user?.id,
        name,
        email,
        subject,
        inquiryType,
        message,
        priority: getPriorityFromType(inquiryType),
      },
    });

    logger.info(`New contact message from: ${email}`);

    // Create notification for admins
    try {
      await prisma.notification.create({
        data: {
          title: `New Inquiry: ${subject}`,
          message: `${name} (${email}): ${message.substring(0, 50)}...`,
          type: "INFO",
          isGlobal: true, // Visible to all admins
          productId: "ADMIN_ONLY", // Target only admins
          scheduledAt: null,
          createdBy: req.user?.id || null,
        },
      });

      // Emit socket event to admins
      const io = req.app.get("io");
      if (io) {
        io.to("admin_notifications").emit("new_notification", {
          title: `New Inquiry: ${subject}`,
          message: `${name} (${email}): ${message.substring(0, 50)}...`,
          type: "INFO",
        });
      }
    } catch (notifError) {
      console.error("Failed to create contact notification:", notifError);
    }

    // TODO: Send email notification to admin
    // await sendNotificationEmail(contactMessage);

    res.status(201).json({
      success: true,
      message:
        "Your message has been sent. We will get back to you within 2 hours.",
      data: {
        id: contactMessage.id,
        createdAt: contactMessage.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages (Admin)
// @route   GET /api/contact
// @access  Admin
exports.getAllMessages = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      inquiryType,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (inquiryType) {
      where.inquiryType = inquiryType;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      prisma.contactMessage.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        messages,
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

// @desc    Get message by ID (Admin)
// @route   GET /api/contact/:id
// @access  Admin
exports.getMessageById = async (req, res, next) => {
  try {
    const message = await prisma.contactMessage.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!message) {
      return next(new AppError("Message not found", 404));
    }

    // Mark as in progress if new
    if (message.status === "NEW") {
      await prisma.contactMessage.update({
        where: { id: req.params.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    res.status(200).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update message status (Admin)
// @route   PATCH /api/contact/:id/status
// @access  Admin
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (!validStatuses.includes(status)) {
      return next(new AppError("Invalid status", 400));
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign message (Admin)
// @route   PATCH /api/contact/:id/assign
// @access  Admin
exports.assignMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const message = await prisma.contactMessage.update({
      where: { id },
      data: {
        assignedTo,
        status: "IN_PROGRESS",
      },
    });

    res.status(200).json({
      success: true,
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to message (Admin)
// @route   POST /api/contact/:id/respond
// @access  Admin
exports.respondToMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return next(new AppError("Response is required", 400));
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: {
        response,
        respondedAt: new Date(),
        status: "RESOLVED",
      },
    });

    // TODO: Send response email to customer
    // await sendResponseEmail(message.email, response);

    logger.info(`Responded to contact message: ${id}`);

    res.status(200).json({
      success: true,
      message: "Response sent successfully",
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message (Admin)
// @route   DELETE /api/contact/:id
// @access  Admin
exports.deleteMessage = async (req, res, next) => {
  try {
    await prisma.contactMessage.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message statistics (Admin)
// @route   GET /api/contact/stats
// @access  Admin
exports.getMessageStats = async (req, res, next) => {
  try {
    const [total, newCount, inProgress, resolved, byType, byPriority] =
      await Promise.all([
        prisma.contactMessage.count(),
        prisma.contactMessage.count({ where: { status: "NEW" } }),
        prisma.contactMessage.count({ where: { status: "IN_PROGRESS" } }),
        prisma.contactMessage.count({ where: { status: "RESOLVED" } }),
        prisma.contactMessage.groupBy({
          by: ["inquiryType"],
          _count: true,
        }),
        prisma.contactMessage.groupBy({
          by: ["priority"],
          _count: true,
        }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          new: newCount,
          inProgress,
          resolved,
          byType: Object.fromEntries(
            byType.map((t) => [t.inquiryType, t._count])
          ),
          byPriority: Object.fromEntries(
            byPriority.map((p) => [p.priority, p._count])
          ),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to determine priority based on inquiry type
function getPriorityFromType(inquiryType) {
  const priorityMap = {
    technical: "HIGH",
    order: "HIGH",
    returns: "NORMAL",
    product: "NORMAL",
    general: "LOW",
  };
  return priorityMap[inquiryType] || "NORMAL";
}
