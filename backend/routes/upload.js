const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// @route   POST /api/upload/image
// @desc    Upload image to Cloudinary
// @access  Private/Admin
router.post(
  "/image",
  authenticate,
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              folder: "shopdemo",
              transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      res.json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }
  }
);

// @route   POST /api/upload/images
// @desc    Upload multiple images to Cloudinary
// @access  Private/Admin
router.post(
  "/images",
  authenticate,
  requireAdmin,
  upload.array("images", 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No image files provided",
        });
      }

      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: "auto",
                folder: "shopdemo",
                transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(file.buffer);
        });
      });

      const results = await Promise.all(uploadPromises);

      res.json({
        success: true,
        message: "Images uploaded successfully",
        data: {
          images: results.map((result) => ({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            size: result.bytes,
          })),
        },
      });
    } catch (error) {
      console.error("Upload multiple images error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload images",
      });
    }
  }
);

// @route   DELETE /api/upload/image/:publicId
// @desc    Delete image from Cloudinary
// @access  Private/Admin
router.delete(
  "/image/:publicId",
  authenticate,
  requireAdmin,
  async (req, res) => {
    try {
      const { publicId } = req.params;

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === "ok") {
        res.json({
          success: true,
          message: "Image deleted successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Image not found",
        });
      }
    } catch (error) {
      console.error("Delete image error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete image",
      });
    }
  }
);

module.exports = router;
