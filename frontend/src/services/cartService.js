import api from "./api";

export const cartService = {
  // Get user's cart
  getCart: async () => {
    const response = await api.get("/cart");
    return response.data;
  },

  // Add item to cart
  addToCart: async (itemData) => {
    const response = await api.post("/cart", itemData);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (itemId, updateData) => {
    const response = await api.put(`/cart/${itemId}`, updateData);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await api.delete("/cart");
    return response.data;
  },
};
