import api from "./api";

export const productService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // Get single product by ID or slug
  getProduct: async (identifier) => {
    const response = await api.get(`/products/${identifier}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get("/products/categories");
    return response.data;
  },

  // Search products
  searchProducts: async (query, filters = {}) => {
    const params = { search: query, ...filters };
    const response = await api.get("/products", { params });
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const response = await api.get("/products", {
      params: { featured: true, limit },
    });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categorySlug, params = {}) => {
    const response = await api.get("/products", {
      params: { category: categorySlug, ...params },
    });
    return response.data;
  },
};
