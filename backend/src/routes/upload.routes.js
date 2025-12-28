// File Upload Routes
const express = require("express");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const uploadController = require("../controllers/upload.controller");
const { authenticate, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
      ),
      false
    );
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
});

// Routes
router.post(
  "/image",
  authenticate,
  upload.single("image"),
  uploadController.uploadImage
);

router.post(
  "/images",
  authenticate,
  adminOnly,
  upload.array("images", 5),
  uploadController.uploadMultipleImages
);

router.delete(
  "/:filename",
  authenticate,
  adminOnly,
  uploadController.deleteImage
);

module.exports = router;
