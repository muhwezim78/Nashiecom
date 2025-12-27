// User Management Routes (Admin)
const express = require("express");
const { body, param } = require("express-validator");
const userController = require("../controllers/user.controller");
const { authenticate, adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Customer Routes - Address Management
router.get("/addresses", userController.getAddresses);
router.post("/addresses", userController.addAddress);
router.put("/addresses/:id", userController.updateAddress);
router.delete("/addresses/:id", userController.deleteAddress);

// Admin Routes
router.get("/", adminOnly, userController.getAllUsers);
router.get("/stats", adminOnly, userController.getUserStats);
router.get("/:id", adminOnly, userController.getUserById);
router.patch("/:id", adminOnly, userController.updateUser);
router.patch("/:id/status", adminOnly, userController.toggleUserStatus);
router.delete("/:id", adminOnly, userController.deleteUser);

module.exports = router;
