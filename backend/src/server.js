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

    app.listen(PORT, () => {
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

startServer();

module.exports = app;
