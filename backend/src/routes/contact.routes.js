// Contact/Support Routes
const express = require("express");
const { body } = require("express-validator");
const contactController = require("../controllers/contact.controller");
const { authenticate, adminOnly, optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// Validation rules
const contactValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 }),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ max: 200 }),
  body("inquiryType").notEmpty().withMessage("Inquiry type is required"),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 5000 }),
];

// Public Routes
router.post(
  "/",
  optionalAuth,
  validate(contactValidation),
  contactController.createMessage
);

// Admin Routes
router.get("/", authenticate, adminOnly, contactController.getAllMessages);
router.get(
  "/stats",
  authenticate,
  adminOnly,
  contactController.getMessageStats
);
router.get("/:id", authenticate, adminOnly, contactController.getMessageById);
router.patch(
  "/:id/status",
  authenticate,
  adminOnly,
  contactController.updateStatus
);
router.patch(
  "/:id/assign",
  authenticate,
  adminOnly,
  contactController.assignMessage
);
router.post(
  "/:id/respond",
  authenticate,
  adminOnly,
  contactController.respondToMessage
);
router.delete("/:id", authenticate, adminOnly, contactController.deleteMessage);

module.exports = router;
