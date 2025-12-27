// Dashboard Analytics Routes (Admin)
const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(adminOnly);

// Dashboard Statistics
router.get("/stats", dashboardController.getStats);
router.get("/revenue", dashboardController.getRevenueStats);
router.get("/orders", dashboardController.getOrderStats);
router.get("/products/top", dashboardController.getTopProducts);
router.get("/products/low-stock", dashboardController.getLowStockProducts);
router.get("/customers", dashboardController.getCustomerStats);
router.get("/recent-orders", dashboardController.getRecentOrders);
router.get("/activity", dashboardController.getRecentActivity);

module.exports = router;
