import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartService } from "../services/cartService";

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      subtotal: 0,
      totalItems: 0,
      isLoading: false,

      // Actions
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const response = await cartService.getCart();
          const cart = response.data.cart;

          set({
            items: cart.items || [],
            subtotal: cart.subtotal || 0,
            totalItems: cart.totalItems || 0,
            isLoading: false,
          });
        } catch (error) {
          console.error("Fetch cart error:", error);
          set({ isLoading: false });
        }
      },

      addToCart: async (productId, variantId = null, quantity = 1) => {
        set({ isLoading: true });
        try {
          const response = await cartService.addToCart({
            productId,
            variantId,
            quantity,
          });

          const cart = response.data.cart;
          set({
            items: cart.items || [],
            subtotal: cart.subtotal || 0,
            totalItems: cart.totalItems || 0,
            isLoading: false,
          });

          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || "Failed to add to cart",
          };
        }
      },

      updateQuantity: async (itemId, quantity) => {
        set({ isLoading: true });
        try {
          const response = await cartService.updateCartItem(itemId, {
            quantity,
          });

          const cart = response.data.cart;
          set({
            items: cart.items || [],
            subtotal: cart.subtotal || 0,
            totalItems: cart.totalItems || 0,
            isLoading: false,
          });

          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || "Failed to update quantity",
          };
        }
      },

      removeFromCart: async (itemId) => {
        set({ isLoading: true });
        try {
          const response = await cartService.removeFromCart(itemId);

          const cart = response.data.cart;
          set({
            items: cart.items || [],
            subtotal: cart.subtotal || 0,
            totalItems: cart.totalItems || 0,
            isLoading: false,
          });

          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error:
              error.response?.data?.message || "Failed to remove from cart",
          };
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          await cartService.clearCart();
          set({
            items: [],
            subtotal: 0,
            totalItems: 0,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: error.response?.data?.message || "Failed to clear cart",
          };
        }
      },

      // Helper functions
      getItemById: (itemId) => {
        const { items } = get();
        return items.find((item) => item.id === itemId);
      },

      getItemByProduct: (productId, variantId = null) => {
        const { items } = get();
        return items.find(
          (item) => item.productId === productId && item.variantId === variantId
        );
      },

      calculateTotals: () => {
        const { items } = get();
        let subtotal = 0;
        let totalItems = 0;

        items.forEach((item) => {
          subtotal += item.quantity * item.price;
          totalItems += item.quantity;
        });

        set({ subtotal, totalItems });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        subtotal: state.subtotal,
        totalItems: state.totalItems,
      }),
    }
  )
);

export { useCartStore };
