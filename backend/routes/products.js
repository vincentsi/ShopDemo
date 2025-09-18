const express = require("express");
const { body, validationResult, query } = require("express-validator");
const {
  authenticate,
  requireAdmin,
  optionalAuth,
} = require("../middleware/auth");
const ProductService = require("../services/productService");

const router = express.Router();

// Product listing with filters - main endpoint
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("category").optional().isString(),
    query("search").optional().isString(),
    query("minPrice")
      .optional()
      .custom((value) => {
        if (!value || value === "") return true;
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0;
      }),
    query("maxPrice")
      .optional()
      .custom((value) => {
        if (!value || value === "") return true;
        const num = parseFloat(value);
        return !isNaN(num) && num >= 0;
      }),
    query("sort").optional().isIn(["name", "price", "createdAt", "popularity"]),
    query("order").optional().isIn(["ASC", "DESC"]),
  ],
  optionalAuth,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors: errors.array(),
        });
      }

      const result = await ProductService.getProducts(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("Product fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
        error: error.message,
      });
    }
  }
);

// Get all categories - simple endpoint
router.get("/categories", async (req, res) => {
  try {
    const categories = await ProductService.getCategories();
    res.json({ success: true, data: { categories } });
  } catch (error) {
    console.error("Category fetch failed:", error);
    res.status(500).json({
      success: false,
      message: "Could not fetch categories",
      error: error.message,
    });
  }
});

// Get single product by ID or slug
router.get("/:identifier", optionalAuth, async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.identifier);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({ success: true, data: { product } });
  } catch (error) {
    console.error("Product detail fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
});

// Create new product - admin only
router.post(
  "/",
  authenticate,
  requireAdmin,
  [
    body("name").notEmpty().withMessage("Product name required"),
    body("description").notEmpty().withMessage("Description required"),
    body("basePrice").isFloat({ min: 0 }).withMessage("Valid price required"),
    body("categoryId").isInt({ min: 1 }).withMessage("Valid category required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const product = await ProductService.createProduct(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      console.error("Product creation failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create product",
        error: error.message,
      });
    }
  }
);

// Update product - admin only
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("basePrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Valid price required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const product = await ProductService.updateProduct(
        req.params.id,
        req.body
      );
      res.json({ success: true, data: product });
    } catch (error) {
      console.error("Product update failed:", error);
      if (error.message === "Product not found") {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
      res.status(500).json({
        success: false,
        message: "Update failed",
        error: error.message,
      });
    }
  }
);

// Delete product - admin only
router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  try {
    await ProductService.deleteProduct(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Product deletion failed:", error);
    if (error.message === "Product not found") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
});

module.exports = router;
