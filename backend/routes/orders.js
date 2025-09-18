const express = require("express");
const { body, validationResult } = require("express-validator");
const {
  Order,
  OrderItem,
  Cart,
  CartItem,
  Product,
  ProductVariant,
  Address,
} = require("../models");
const { authenticate } = require("../middleware/auth");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post(
  "/",
  [
    body("addressId").isInt().withMessage("Valid address ID is required"),
    body("paymentMethod").optional().isString(),
  ],
  authenticate,
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

      const { addressId, paymentMethod = "stripe" } = req.body;

      // Verify address belongs to user
      const address = await Address.findOne({
        where: { id: addressId, userId: req.user.id },
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      // Get user's cart
      const cart = await Cart.findOne({
        where: { userId: req.user.id, isActive: true },
        include: [
          {
            model: CartItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "product",
              },
              {
                model: ProductVariant,
                as: "variant",
              },
            ],
          },
        ],
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cart is empty",
        });
      }

      // Validate stock and calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of cart.items) {
        const product = item.product;
        const variant = item.variant;

        // Check if product is still active
        if (!product.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product "${product.name}" is no longer available`,
          });
        }

        // Check stock for variants
        if (variant) {
          if (!variant.isActive) {
            return res.status(400).json({
              success: false,
              message: `Variant "${variant.name}" for "${product.name}" is no longer available`,
            });
          }

          if (variant.stock < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Only ${variant.stock} items available for "${product.name} - ${variant.name}"`,
            });
          }
        }

        const price = variant ? variant.currentPrice : product.currentPrice;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: product.id,
          variantId: variant ? variant.id : null,
          productName: product.name,
          variantName: variant ? variant.name : null,
          sku: variant ? variant.sku : product.sku,
          quantity: item.quantity,
          price: price,
          total: itemTotal,
        });
      }

      // Calculate taxes and shipping (simplified)
      const tax = subtotal * 0.2; // 20% VAT
      const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over 50€
      const total = subtotal + tax + shipping;

      // Create order
      const order = await Order.create({
        userId: req.user.id,
        addressId: addressId,
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        paymentMethod: paymentMethod,
        status: "pending",
      });

      // Create order items
      for (const item of orderItems) {
        await OrderItem.create({
          orderId: order.id,
          ...item,
        });
      }

      // Update stock
      for (const item of cart.items) {
        if (item.variant) {
          await item.variant.update({
            stock: item.variant.stock - item.quantity,
          });
        }
      }

      // Create Stripe payment intent
      let paymentIntent = null;
      if (paymentMethod === "stripe") {
        try {
          paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100), // Convert to cents
            currency: "eur",
            metadata: {
              orderId: order.id,
              userId: req.user.id,
            },
          });

          await order.update({
            stripePaymentIntentId: paymentIntent.id,
          });
        } catch (stripeError) {
          console.error("Stripe error:", stripeError);
          // Continue without Stripe for demo purposes
        }
      }

      // Clear cart
      await CartItem.destroy({
        where: { cartId: cart.id },
      });

      // Get complete order with relations
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["id", "name", "slug", "images"],
              },
              {
                model: ProductVariant,
                as: "variant",
                attributes: ["id", "name", "attributes", "image"],
              },
            ],
          },
          {
            model: Address,
            as: "address",
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: {
          order: completeOrder,
          paymentIntent: paymentIntent
            ? {
                id: paymentIntent.id,
                clientSecret: paymentIntent.client_secret,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get("/", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "slug", "images"],
            },
            {
              model: ProductVariant,
              as: "variant",
              attributes: ["id", "name", "attributes", "image"],
            },
          ],
        },
        {
          model: Address,
          as: "address",
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
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get("/:id", authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "slug", "images"],
            },
            {
              model: ProductVariant,
              as: "variant",
              attributes: ["id", "name", "attributes", "image"],
            },
          ],
        },
        {
          model: Address,
          as: "address",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put("/:id/cancel", authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!["pending", "paid"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Restore stock
    const orderItems = await OrderItem.findAll({
      where: { orderId: order.id },
      include: [
        {
          model: ProductVariant,
          as: "variant",
        },
      ],
    });

    for (const item of orderItems) {
      if (item.variant) {
        await item.variant.update({
          stock: item.variant.stock + item.quantity,
        });
      }
    }

    await order.update({
      status: "cancelled",
    });

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
