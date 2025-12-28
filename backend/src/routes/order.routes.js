// Order Routes
const express = require("express");
const { body } = require("express-validator");
const orderController = require("../controllers/order.controller");
const { authenticate, adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must have at least one item"),
  body("items.*.productId").isUUID().withMessage("Invalid product ID"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("shippingAddress")
    .notEmpty()
    .withMessage("Shipping address is required"),
  body("paymentMethod").notEmpty().withMessage("Payment method is required"),
];

// All routes require authentication
router.use(authenticate);

// Customer Routes
router.get("/my-orders", orderController.getMyOrders);
router.get("/:id", orderController.getOrderById);
router.post("/", validate(createOrderValidation), orderController.createOrder);
router.post("/:id/cancel", orderController.cancelOrder);
router.patch("/:id/confirm-delivery", orderController.confirmDelivery);

// Admin Routes
router.get("/", adminOnly, orderController.getAllOrders);
router.get("/stats", adminOnly, orderController.getOrderStats);
router.patch("/:id/status", adminOnly, orderController.updateOrderStatus);
router.patch(
  "/:id/payment-status",
  adminOnly,
  orderController.updatePaymentStatus
);
router.post("/:id/tracking", adminOnly, orderController.addTracking);
router.delete("/:id", adminOnly, orderController.deleteOrder);

module.exports = router;
