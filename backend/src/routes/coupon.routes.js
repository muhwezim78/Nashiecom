// Coupon Routes
const express = require("express");
const { body } = require("express-validator");
const couponController = require("../controllers/coupon.controller");
const { authenticate, adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// Validation rules
const couponValidation = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Coupon code is required")
    .isLength({ max: 50 })
    .toUpperCase(),
  body("discountType")
    .isIn(["PERCENTAGE", "FIXED"])
    .withMessage("Invalid discount type"),
  body("discountValue")
    .isFloat({ min: 0 })
    .withMessage("Discount value must be positive"),
];

// Public Routes
router.post("/validate", authenticate, couponController.validateCoupon);

// Admin Routes
router.get("/", authenticate, adminOnly, couponController.getAllCoupons);
router.get("/:id", authenticate, adminOnly, couponController.getCouponById);
router.post(
  "/",
  authenticate,
  adminOnly,
  validate(couponValidation),
  couponController.createCoupon
);
router.put("/:id", authenticate, adminOnly, couponController.updateCoupon);
router.delete("/:id", authenticate, adminOnly, couponController.deleteCoupon);
router.patch(
  "/:id/toggle-status",
  authenticate,
  adminOnly,
  couponController.toggleStatus
);

module.exports = router;
