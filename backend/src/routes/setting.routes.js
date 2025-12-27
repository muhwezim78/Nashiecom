// Settings Routes
const express = require("express");
const { body } = require("express-validator");
const settingController = require("../controllers/setting.controller");
const {
  authenticate,
  adminOnly,
  superAdminOnly,
} = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();

// Public Routes - Get public settings
router.get("/public", settingController.getPublicSettings);

// Admin Routes
router.get("/", authenticate, adminOnly, settingController.getAllSettings);
router.get(
  "/group/:group",
  authenticate,
  adminOnly,
  settingController.getSettingsByGroup
);
router.get("/:key", authenticate, adminOnly, settingController.getSetting);
router.put(
  "/:key",
  authenticate,
  superAdminOnly,
  settingController.updateSetting
);
router.post(
  "/bulk",
  authenticate,
  superAdminOnly,
  settingController.bulkUpdateSettings
);

module.exports = router;
