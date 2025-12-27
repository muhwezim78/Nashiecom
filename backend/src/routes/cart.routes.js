// Cart Routes
const express = require("express");
const { body } = require("express-validator");
const cartController = require("../controllers/cart.controller");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// Validation rules
const addToCartValidation = [
  body("productId").isUUID().withMessage("Invalid product ID"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

const updateCartValidation = [
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
];

// All routes require authentication
router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/", validate(addToCartValidation), cartController.addToCart);
router.put(
  "/:productId",
  validate(updateCartValidation),
  cartController.updateCartItem
);
router.delete("/:productId", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

// Sync cart from frontend (for logged in users)
router.post("/sync", cartController.syncCart);

module.exports = router;
