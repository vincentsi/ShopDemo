const express = require("express");
const { body, validationResult, query } = require("express-validator");
const {
  Order,
  OrderItem,
  Product,
  ProductVariant,
  Category,
  User,
} = require("../models");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { Op } = require("sequelize");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get("/dashboard", async (req, res) => {
  try {
    const { period = "30" } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get basic stats
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      // Total orders in period
      Order.count({
        where: {
          createdAt: { [Op.gte]: startDate },
          status: { [Op.ne]: "cancelled" },
        },
      }),

      // Total revenue in period
      Order.sum("total", {
        where: {
          createdAt: { [Op.gte]: startDate },
          status: { [Op.in]: ["paid", "processing", "shipped", "delivered"] },
        },
      }),

      // Total active products
      Product.count({
        where: { isActive: true },
      }),

      // Total active users
      User.count({
        where: { isActive: true },
      }),

      // Recent orders
      Order.findAll({
        where: {
          createdAt: { [Op.gte]: startDate },
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 10,
      }),

      // Top selling products
      OrderItem.findAll({
        attributes: [
          "productId",
          [
            require("sequelize").fn(
              "SUM",
              require("sequelize").col("quantity")
            ),
            "totalSold",
          ],
          [
            require("sequelize").fn("SUM", require("sequelize").col("total")),
            "totalRevenue",
          ],
        ],
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "images"],
          },
          {
            model: Order,
            as: "order",
            where: {
              status: {
                [Op.in]: ["paid", "processing", "shipped", "delivered"],
              },
              createdAt: { [Op.gte]: startDate },
            },
            attributes: [],
          },
        ],
        group: ["productId"],
        order: [
          [
            require("sequelize").fn(
              "SUM",
              require("sequelize").col("quantity")
            ),
            "DESC",
          ],
        ],
        limit: 10,
      }),
    ]);

    // Daily revenue for chart
    const dailyRevenue = await Order.findAll({
      attributes: [
        [
          require("sequelize").fn(
            "DATE",
            require("sequelize").col("createdAt")
          ),
          "date",
        ],
        [
          require("sequelize").fn("SUM", require("sequelize").col("total")),
          "revenue",
        ],
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "orders",
        ],
      ],
      where: {
        createdAt: { [Op.gte]: startDate },
        status: { [Op.in]: ["paid", "processing", "shipped", "delivered"] },
      },
      group: [
        require("sequelize").fn("DATE", require("sequelize").col("createdAt")),
      ],
      order: [
        [
          require("sequelize").fn(
            "DATE",
            require("sequelize").col("createdAt")
          ),
          "ASC",
        ],
      ],
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders: totalOrders || 0,
          totalRevenue: parseFloat((totalRevenue || 0).toFixed(2)),
          totalProducts: totalProducts || 0,
          totalUsers: totalUsers || 0,
        },
        recentOrders,
        topProducts,
        dailyRevenue,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders with filters
// @access  Private/Admin
router.get(
  "/orders",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isString(),
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601(),
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

      const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }

      if (dateFrom || dateTo) {
        whereClause.createdAt = {};
        if (dateFrom) whereClause.createdAt[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.createdAt[Op.lte] = new Date(dateTo);
      }

      const { count, rows: orders } = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: OrderItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["id", "name", "images"],
              },
              {
                model: ProductVariant,
                as: "variant",
                attributes: ["id", "name", "attributes"],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: {
          orders,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalOrders: count,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get admin orders error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put(
  "/orders/:id/status",
  [
    body("status")
      .isIn([
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ])
      .withMessage("Invalid status"),
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

      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const updateData = { status };

      // Set timestamps for specific statuses
      if (status === "shipped" && !order.shippedAt) {
        updateData.shippedAt = new Date();
      }
      if (status === "delivered" && !order.deliveredAt) {
        updateData.deliveredAt = new Date();
      }

      await order.update(updateData);

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: {
          order,
        },
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/admin/products
// @desc    Get all products for admin
// @access  Private/Admin
router.get("/products", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
      ];
    }
    if (category) {
      whereClause.categoryId = category;
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: ProductVariant,
          as: "variants",
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get admin products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/admin/products/:id/variants
// @desc    Add variant to product
// @access  Private/Admin
router.post(
  "/products/:id/variants",
  [
    body("name").trim().notEmpty().withMessage("Variant name is required"),
    body("price").optional().isFloat({ min: 0 }),
    body("salePrice").optional().isFloat({ min: 0 }),
    body("stock")
      .isInt({ min: 0 })
      .withMessage("Valid stock quantity is required"),
    body("attributes").optional().isObject(),
    body("sku").optional().isString(),
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

      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const variant = await ProductVariant.create({
        productId: product.id,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: "Product variant created successfully",
        data: {
          variant,
        },
      });
    } catch (error) {
      console.error("Create product variant error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/admin/products/:id/variants/:variantId
// @desc    Update product variant
// @access  Private/Admin
router.put(
  "/products/:id/variants/:variantId",
  [
    body("name").optional().trim().notEmpty(),
    body("price").optional().isFloat({ min: 0 }),
    body("salePrice").optional().isFloat({ min: 0 }),
    body("stock").optional().isInt({ min: 0 }),
    body("attributes").optional().isObject(),
    body("sku").optional().isString(),
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

      const variant = await ProductVariant.findOne({
        where: {
          id: req.params.variantId,
          productId: req.params.id,
        },
      });

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "Product variant not found",
        });
      }

      await variant.update(req.body);

      res.json({
        success: true,
        message: "Product variant updated successfully",
        data: {
          variant,
        },
      });
    } catch (error) {
      console.error("Update product variant error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   DELETE /api/admin/products/:id/variants/:variantId
// @desc    Delete product variant
// @access  Private/Admin
router.delete("/products/:id/variants/:variantId", async (req, res) => {
  try {
    const variant = await ProductVariant.findOne({
      where: {
        id: req.params.variantId,
        productId: req.params.id,
      },
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    await variant.update({ isActive: false });

    res.json({
      success: true,
      message: "Product variant deleted successfully",
    });
  } catch (error) {
    console.error("Delete product variant error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
