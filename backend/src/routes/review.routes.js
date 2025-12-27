// Review Routes
const express = require("express");
const { body } = require("express-validator");
const reviewController = require("../controllers/review.controller");
const { authenticate, adminOnly, optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// Validation rules
const reviewValidation = [
  body("productId").isUUID().withMessage("Invalid product ID"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("title").optional().trim().isLength({ max: 200 }),
  body("comment").optional().trim().isLength({ max: 2000 }),
];

// Public Routes
router.get(
  "/product/:productId",
  optionalAuth,
  reviewController.getProductReviews
);

// Customer Routes
router.post(
  "/",
  authenticate,
  validate(reviewValidation),
  reviewController.createReview
);
router.put("/:id", authenticate, reviewController.updateReview);
router.delete("/:id", authenticate, reviewController.deleteReview);

// Admin Routes
router.get("/", authenticate, adminOnly, reviewController.getAllReviews);
router.patch(
  "/:id/approve",
  authenticate,
  adminOnly,
  reviewController.approveReview
);
router.patch(
  "/:id/reject",
  authenticate,
  adminOnly,
  reviewController.rejectReview
);

module.exports = router;
