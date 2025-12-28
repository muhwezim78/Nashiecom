// Main Server Entry Point for Nashiecom Technologies Backend
// Express.js + PostgreSQL with Prisma ORM

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const { PrismaClient } = require("@prisma/client");
const logger = require("./config/logger");
const errorHandler = require("./middleware/errorHandler");
const { notFound } = require("./middleware/notFound");

// Import Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const orderRoutes = require("./routes/order.routes");
const cartRoutes = require("./routes/cart.routes");
const reviewRoutes = require("./routes/review.routes");
const couponRoutes = require("./routes/coupon.routes");
const contactRoutes = require("./routes/contact.routes");
const settingRoutes = require("./routes/setting.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const uploadRoutes = require("./routes/upload.routes");
const searchRoutes = require("./routes/search.routes");
const chatRoutes = require("./routes/chat.routes");
const notificationRoutes = require("./routes/notification.routes");

// Initialize Express App
const app = express();
const prisma = new PrismaClient();

// Trust proxy for rate limiting behind reverse proxy
app.set("trust proxy", 1);

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// Static Files (for uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health Check Endpoint
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: "Nashiecom API is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Service unavailable",
      database: "disconnected",
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// API Documentation Route
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Nashiecom Technologies API",
    version: "1.0.0",
    documentation: "/api/docs",
    endpoints: {
      health: "GET /api/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        logout: "POST /api/auth/logout",
        me: "GET /api/auth/me",
        refreshToken: "POST /api/auth/refresh",
      },
      products: {
        list: "GET /api/products",
        featured: "GET /api/products/featured",
        single: "GET /api/products/:id",
        create: "POST /api/products (Admin)",
        update: "PUT /api/products/:id (Admin)",
        delete: "DELETE /api/products/:id (Admin)",
      },
      categories: {
        list: "GET /api/categories",
        single: "GET /api/categories/:id",
        products: "GET /api/categories/:id/products",
      },
      orders: {
        list: "GET /api/orders",
        single: "GET /api/orders/:id",
        create: "POST /api/orders",
        updateStatus: "PATCH /api/orders/:id/status (Admin)",
      },
      cart: {
        get: "GET /api/cart",
        add: "POST /api/cart",
        update: "PUT /api/cart/:productId",
        remove: "DELETE /api/cart/:productId",
        clear: "DELETE /api/cart",
      },
      dashboard: "GET /api/dashboard/stats (Admin)",
    },
  });
});

// Create HTTP Server for Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io Middleware for Auth (optional, but good)
// For simplicity, we'll just handle events. In a real app, you'd verify JWT here too.

// Socket.io Connection Handler
io.on("connection", (socket) => {
  logger.info(`🔌 User connected: ${socket.id}`);

  // Join a room for a specific order
  socket.on("join_order_chat", (orderId) => {
    socket.join(orderId);
    logger.info(`📁 User joined chat for order: ${orderId}`);
  });

  // Handle incoming messages
  socket.on("send_message", (data) => {
    // data expected: { orderId, message }
    // Emit to everyone in the room (including sender if we want, or use broadcast)
    io.to(data.orderId).emit("receive_message", data.message);
  });

  // Handle delivery confirmation updates
  socket.on("delivery_update", (data) => {
    // data: { orderId, order }
    io.to(data.orderId).emit("order_updated", data.order);
  });

  socket.on("join_user_notifications", (userId) => {
    logger.info(`🔔 User joined notification channel: ${userId}`);
    socket.join(`user_${userId}`);
  });

  socket.on("join_admin_notifications", () => {
    logger.info(`🛡️ Admin joined notification channel`);
    socket.join("admin_notifications");
  });

  socket.on("disconnect", () => {
    logger.info(`❌ User disconnected: ${socket.id}`);
  });
});

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info("📦 Database connected successfully");

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📍 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// Make io accessible to our router wrapper if needed,
// but easier is to attach it to the app or export it.
app.set("io", io);

startServer();

module.exports = app;
