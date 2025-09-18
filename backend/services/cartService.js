const { Cart, CartItem, Product, ProductVariant } = require("../models");

class CartService {
  /**
   * Get user's cart
   */
  static async getCart(userId) {
    let cart = await Cart.findOne({
      where: { userId },
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
                "basePrice",
                "salePrice",
                "images",
              ],
            },
            {
              model: ProductVariant,
              as: "variant",
              attributes: ["id", "name", "price", "salePrice", "attributes"],
            },
          ],
        },
      ],
    });

    if (!cart) {
      cart = await Cart.create({ userId });
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  static async addToCart(userId, productId, variantId = null, quantity = 1) {
    let cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // Check if item already exists
    const existingItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return existingItem;
    }

    // Create new cart item
    const cartItem = await CartItem.create({
      cartId: cart.id,
      productId,
      variantId,
      quantity,
    });

    return cartItem;
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(userId, itemId, quantity) {
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      throw new Error("Cart not found");
    }

    const cartItem = await CartItem.findOne({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    if (quantity <= 0) {
      await cartItem.destroy();
      return null;
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    return cartItem;
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(userId, itemId) {
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      throw new Error("Cart not found");
    }

    const cartItem = await CartItem.findOne({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    await cartItem.destroy();
    return { success: true };
  }

  /**
   * Clear cart
   */
  static async clearCart(userId) {
    const cart = await Cart.findOne({ where: { userId } });
    if (!cart) {
      throw new Error("Cart not found");
    }

    await CartItem.destroy({ where: { cartId: cart.id } });
    return { success: true };
  }

  /**
   * Calculate cart total
   */
  static async calculateCartTotal(cart) {
    let total = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      const price =
        item.variant?.salePrice ||
        item.variant?.price ||
        item.product?.salePrice ||
        item.product?.basePrice ||
        0;
      total += price * item.quantity;
      itemCount += item.quantity;
    }

    return {
      total: parseFloat(total.toFixed(2)),
      itemCount,
    };
  }
}

module.exports = CartService;
