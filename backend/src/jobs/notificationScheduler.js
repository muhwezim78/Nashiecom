const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const logger = require("../config/logger");

const prisma = new PrismaClient();

const initScheduler = (app) => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    logger.info("⏰ Checking for scheduled notifications...");

    try {
      const now = new Date();

      // Find due notifications that haven't been sent
      const dueNotifications = await prisma.notification.findMany({
        where: {
          isActive: true,
          scheduledAt: {
            lte: now,
          },
          sentAt: null,
        },
      });

      if (dueNotifications.length > 0) {
        logger.info(
          `Found ${dueNotifications.length} scheduled notifications to send.`
        );

        const io = app.get("io");

        for (const notification of dueNotifications) {
          // 1. Emit socket event
          if (io) {
            if (notification.isGlobal) {
              // Check if ADMIN_ONLY
              if (notification.productId === "ADMIN_ONLY") {
                io.to("admin_notifications").emit("new_notification", {
                  id: notification.id,
                  title: notification.title,
                  message: notification.message,
                  type: notification.type,
                });
              } else {
                // Public/Global
                io.emit("new_notification", {
                  id: notification.id,
                  title: notification.title,
                  message: notification.message,
                  type: notification.type,
                });
              }
            } else if (notification.userId) {
              io.to(`user_${notification.userId}`).emit("new_notification", {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
              });
            }
          }

          // 2. Mark as sent
          await prisma.notification.update({
            where: { id: notification.id },
            data: { sentAt: now },
          });

          logger.info(`✅ Sent scheduled notification: ${notification.title}`);
        }
      }
    } catch (error) {
      logger.error("❌ Error in notification scheduler:", error);
    }
  });

  logger.info("🗓️  Notification scheduler initialized");
};

module.exports = initScheduler;
