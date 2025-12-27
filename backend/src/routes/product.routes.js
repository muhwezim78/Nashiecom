// Product Routes
const express = require("express");
const { body, query, param } = require("express-validator");
const productController = require("../controllers/product.controller");
const { authenticate, adminOnly, optionalAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");

const cache = require("../middleware/cache");

const router = express.Router();

// Validation rules
const productValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ max: 200 }),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("categoryId")
    .notEmpty()
    .withMessage("Category is required")
    .isUUID()
    .withMessage("Invalid category ID"),
  body("description").optional().isLength({ max: 5000 }),
  body("quantity").optional().isInt({ min: 0 }),
  body("originalPrice").optional().isFloat({ min: 0 }),
];

// Public Routes
router.get("/", optionalAuth, cache(300), productController.getAllProducts);
router.get("/featured", cache(300), productController.getFeaturedProducts);
router.get("/search", cache(60), productController.searchProducts);
router.get("/slug/:slug", cache(300), productController.getProductBySlug);
router.get("/:id", optionalAuth, cache(300), productController.getProductById);

// Admin Routes
router.post(
  "/",
  authenticate,
  adminOnly,
  validate(productValidation),
  productController.createProduct
);
router.put("/:id", authenticate, adminOnly, productController.updateProduct);
router.delete("/:id", authenticate, adminOnly, productController.deleteProduct);
router.patch(
  "/:id/toggle-featured",
  authenticate,
  adminOnly,
  productController.toggleFeatured
);
router.patch(
  "/:id/toggle-status",
  authenticate,
  adminOnly,
  productController.toggleStatus
);
router.post(
  "/:id/images",
  authenticate,
  adminOnly,
  productController.addProductImages
);
router.delete(
  "/:id/images/:imageId",
  authenticate,
  adminOnly,
  productController.deleteProductImage
);

module.exports = router;
