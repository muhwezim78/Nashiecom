// Upload Controller
const path = require("path");
const fs = require("fs");
const { AppError } = require("../middleware/errorHandler");

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Admin
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("No file uploaded", 400));
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${baseUrl}/api/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        filename: req.file.filename,
        url: imageUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Admin
exports.uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new AppError("No files uploaded", 400));
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const images = req.files.map((file) => ({
      filename: file.filename,
      url: `${baseUrl}/api/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.status(200).json({
      success: true,
      data: { images },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete image
// @route   DELETE /api/upload/:filename
// @access  Admin
exports.deleteImage = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../../uploads", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next(new AppError("File not found", 404));
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
