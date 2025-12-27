// Settings Controller
const prisma = require("../config/database");
const { AppError } = require("../middleware/errorHandler");

// Public settings that can be accessed without authentication
const PUBLIC_SETTINGS = [
  "store_name",
  "store_email",
  "store_phone",
  "store_address",
  "currency",
  "currency_symbol",
  "tax_rate",
  "free_shipping_threshold",
  "default_shipping_fee",
];

// @desc    Get public settings
// @route   GET /api/settings/public
// @access  Public
exports.getPublicSettings = async (req, res, next) => {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: PUBLIC_SETTINGS },
      },
    });

    // Convert to object
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = parseSettingValue(s.value, s.type);
    });

    res.status(200).json({
      success: true,
      data: { settings: settingsObj },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all settings (Admin)
// @route   GET /api/settings
// @access  Admin
exports.getAllSettings = async (req, res, next) => {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    // Group settings
    const grouped = {};
    settings.forEach((s) => {
      if (!grouped[s.group]) {
        grouped[s.group] = [];
      }
      grouped[s.group].push({
        ...s,
        value: parseSettingValue(s.value, s.type),
      });
    });

    res.status(200).json({
      success: true,
      data: { settings: grouped },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get settings by group (Admin)
// @route   GET /api/settings/group/:group
// @access  Admin
exports.getSettingsByGroup = async (req, res, next) => {
  try {
    const { group } = req.params;

    const settings = await prisma.setting.findMany({
      where: { group },
      orderBy: { key: "asc" },
    });

    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = parseSettingValue(s.value, s.type);
    });

    res.status(200).json({
      success: true,
      data: { settings: settingsObj },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single setting (Admin)
// @route   GET /api/settings/:key
// @access  Admin
exports.getSetting = async (req, res, next) => {
  try {
    const { key } = req.params;

    const setting = await prisma.setting.findUnique({
      where: { key },
    });

    if (!setting) {
      return next(new AppError("Setting not found", 404));
    }

    res.status(200).json({
      success: true,
      data: {
        setting: {
          ...setting,
          value: parseSettingValue(setting.value, setting.type),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update setting (Super Admin)
// @route   PUT /api/settings/:key
// @access  Super Admin
exports.updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, type } = req.body;

    // Convert value to string for storage
    const stringValue =
      typeof value === "object" ? JSON.stringify(value) : String(value);

    const setting = await prisma.setting.upsert({
      where: { key },
      create: {
        key,
        value: stringValue,
        type: type || "string",
        group: req.body.group || "general",
      },
      update: {
        value: stringValue,
        type,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        setting: {
          ...setting,
          value: parseSettingValue(setting.value, setting.type),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update settings (Super Admin)
// @route   POST /api/settings/bulk
// @access  Super Admin
exports.bulkUpdateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
      return next(new AppError("Settings must be an array", 400));
    }

    const results = [];

    for (const { key, value, type, group } of settings) {
      const stringValue =
        typeof value === "object" ? JSON.stringify(value) : String(value);

      const setting = await prisma.setting.upsert({
        where: { key },
        create: {
          key,
          value: stringValue,
          type: type || "string",
          group: group || "general",
        },
        update: {
          value: stringValue,
          type,
        },
      });

      results.push({
        key: setting.key,
        value: parseSettingValue(setting.value, setting.type),
      });
    }

    res.status(200).json({
      success: true,
      data: { settings: results },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to parse setting value based on type
function parseSettingValue(value, type) {
  switch (type) {
    case "number":
      return parseFloat(value);
    case "boolean":
      return value === "true";
    case "json":
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}
