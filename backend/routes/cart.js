const express = require("express");
const { body, validationResult } = require("express-validator");
const { Cart, CartItem, Product, ProductVariant } = require("../models");
const { authenticate, optionalAuth } = require("../middleware/auth");
const { Op } = require("sequelize");

const router = express.Router();

// Helper function to get or create cart
const getOrCreateCart = async (userId, sessionId = null) => {
  let cart = await Cart.findOne({
    where: {
      [Op.or]: [{ userId: userId }, { sessionId: sessionId }],
      isActive: true,
    },
    include: [
      {
        model: CartItem,
        as: "items",
        include: [
          {
            model: Product,
            as: "product",
            attributes: [
              "id",
              "name",
              "slug",
              "images",
              "basePrice",
              "salePrice",
            ],
          },
          {
            model: ProductVariant,
            as: "variant",
            attributes: [
              "id",
              "name",
              "price",
              "salePrice",
              "stock",
              "attributes",
              "image",
            ],
          },
        ],
      },
    ],
  });

  if (!cart) {
    cart = await Cart.create({
      userId: userId,
      sessionId: sessionId,
    });
  }

  return cart;
};

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get("/", authenticate, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);

    // Calculate totals
    let subtotal = 0;
    let totalItems = 0;

    cart.items.forEach((item) => {
      const price = item.variant?.currentPrice || item.product.currentPrice;
      subtotal += item.quantity * price;
      totalItems += item.quantity;
    });

    res.json({
      success: true,
      data: {
        cart: {
          ...cart.toJSON(),
          subtotal: parseFloat(subtotal.toFixed(2)),
          totalItems,
        },
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post(
  "/",
  [
    body("productId").isInt().withMessage("Valid product ID is required"),
    body("variantId").optional().isInt(),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
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

      const { productId, variantId, quantity } = req.body;

      // Verify product exists and is active
      const product = await Product.findOne({
        where: { id: productId, isActive: true },
        include: [
          {
            model: ProductVariant,
            as: "variants",
            where: { isActive: true },
            required: false,
          },
        ],
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // If variant is specified, verify it exists and belongs to the product
      let variant = null;
      if (variantId) {
        variant = await ProductVariant.findOne({
          where: {
            id: variantId,
            productId: productId,
            isActive: true,
          },
        });

        if (!variant) {
          return res.status(404).json({
            success: false,
            message: "Product variant not found",
          });
        }

        // Check stock
        if (variant.stock < quantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${variant.stock} items available in stock`,
          });
        }
      } else {
        // Check if product has variants (if so, variant is required)
        if (product.variants && product.variants.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Product variant is required",
          });
        }
      }

      // Get or create cart
      const cart = await getOrCreateCart(req.user.id);

      // Check if item already exists in cart
      const existingItem = await CartItem.findOne({
        where: {
          cartId: cart.id,
          productId: productId,
          variantId: variantId || null,
        },
      });

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;

        // Check stock again
        const maxStock = variant ? variant.stock : 999; // Assume unlimited stock for products without variants
        if (newQuantity > maxStock) {
          return res.status(400).json({
            success: false,
            message: `Cannot add ${quantity} items. Maximum available: ${
              maxStock - existingItem.quantity
            }`,
          });
        }

        await existingItem.update({ quantity: newQuantity });
      } else {
        // Add new item
        const price = variant ? variant.currentPrice : product.currentPrice;

        await CartItem.create({
          cartId: cart.id,
          productId: productId,
          variantId: variantId,
          quantity: quantity,
          price: price,
        });
      }

      // Return updated cart
      const updatedCart = await getOrCreateCart(req.user.id);
      let subtotal = 0;
      let totalItems = 0;

      updatedCart.items.forEach((item) => {
        subtotal += item.quantity * item.price;
        totalItems += item.quantity;
      });

      res.json({
        success: true,
        message: "Item added to cart successfully",
        data: {
          cart: {
            ...updatedCart.toJSON(),
            subtotal: parseFloat(subtotal.toFixed(2)),
            totalItems,
          },
        },
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   PUT /api/cart/:itemId
// @desc    Update cart item quantity
// @access  Private
router.put(
  "/:itemId",
  [
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
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

      const { itemId } = req.params;
      const { quantity } = req.body;

      const cart = await getOrCreateCart(req.user.id);

      const cartItem = await CartItem.findOne({
        where: {
          id: itemId,
          cartId: cart.id,
        },
        include: [
          {
            model: ProductVariant,
            as: "variant",
          },
        ],
      });

      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
      }

      // Check stock
      if (cartItem.variant && cartItem.variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${cartItem.variant.stock} items available in stock`,
        });
      }

      await cartItem.update({ quantity });

      // Return updated cart
      const updatedCart = await getOrCreateCart(req.user.id);
      let subtotal = 0;
      let totalItems = 0;

      updatedCart.items.forEach((item) => {
        subtotal += item.quantity * item.price;
        totalItems += item.quantity;
      });

      res.json({
        success: true,
        message: "Cart item updated successfully",
        data: {
          cart: {
            ...updatedCart.toJSON(),
            subtotal: parseFloat(subtotal.toFixed(2)),
            totalItems,
          },
        },
      });
    } catch (error) {
      console.error("Update cart item error:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete("/:itemId", authenticate, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await getOrCreateCart(req.user.id);

    const cartItem = await CartItem.findOne({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    await cartItem.destroy();

    // Return updated cart
    const updatedCart = await getOrCreateCart(req.user.id);
    let subtotal = 0;
    let totalItems = 0;

    updatedCart.items.forEach((item) => {
      subtotal += item.quantity * item.price;
      totalItems += item.quantity;
    });

    res.json({
      success: true,
      message: "Item removed from cart successfully",
      data: {
        cart: {
          ...updatedCart.toJSON(),
          subtotal: parseFloat(subtotal.toFixed(2)),
          totalItems,
        },
      },
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete("/", authenticate, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);

    await CartItem.destroy({
      where: { cartId: cart.id },
    });

    res.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
