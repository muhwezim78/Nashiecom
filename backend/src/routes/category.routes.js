// Category Routes
const express = require("express");
const { body } = require("express-validator");
const categoryController = require("../controllers/category.controller");
const { authenticate, adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");

const cache = require("../middleware/cache");

const router = express.Router();

// Validation rules
const categoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ max: 100 }),
  body("description").optional().isLength({ max: 500 }),
  body("icon").optional().isLength({ max: 50 }),
];

// Public Routes
router.get("/", cache(300), categoryController.getAllCategories);
router.get("/tree", cache(300), categoryController.getCategoryTree);
router.get("/:id", cache(300), categoryController.getCategoryById);
router.get("/:id/products", cache(300), categoryController.getCategoryProducts);
router.get("/slug/:slug", cache(300), categoryController.getCategoryBySlug);

// Admin Routes
router.post(
  "/",
  authenticate,
  adminOnly,
  validate(categoryValidation),
  categoryController.createCategory
);
router.put("/:id", authenticate, adminOnly, categoryController.updateCategory);
router.delete(
  "/:id",
  authenticate,
  adminOnly,
  categoryController.deleteCategory
);
router.patch(
  "/:id/toggle-status",
  authenticate,
  adminOnly,
  categoryController.toggleStatus
);
router.patch(
  "/:id/toggle-featured",
  authenticate,
  adminOnly,
  categoryController.toggleFeatured
);

module.exports = router;
