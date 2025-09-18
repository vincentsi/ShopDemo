const { Product, ProductVariant, Category } = require("../models");
const { Op } = require("sequelize");

class ProductService {
  // Main product listing with filters
  static async getProducts(filters = {}) {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "DESC",
      featured,
    } = filters;

    const offset = (page - 1) * limit;
    const whereClause = { isActive: true };

    // Featured filter
    if (featured === "true") {
      whereClause.isFeatured = true;
    }

    // Category filtering - handle both ID and slug
    if (category) {
      if (/^\d+$/.test(category)) {
        whereClause.categoryId = parseInt(category);
      } else {
        const categoryRecord = await Category.findOne({
          where: { slug: category, isActive: true },
          attributes: ["id"],
        });
        if (categoryRecord) {
          whereClause.categoryId = categoryRecord.id;
        }
      }
    }

    // Search across multiple fields
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { shortDescription: { [Op.like]: `%${search}%` } },
      ];
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      whereClause[Op.and] = [];
      if (minPrice) {
        whereClause[Op.and].push({
          [Op.or]: [
            { basePrice: { [Op.gte]: parseFloat(minPrice) } },
            { salePrice: { [Op.gte]: parseFloat(minPrice) } },
          ],
        });
      }
      if (maxPrice) {
        whereClause[Op.and].push({
          [Op.or]: [
            { basePrice: { [Op.lte]: parseFloat(maxPrice) } },
            { salePrice: { [Op.lte]: parseFloat(maxPrice) } },
          ],
        });
      }
    }

    const orderClause = this.buildOrderClause(sort, order);

    const products = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const count = await Product.count({ where: whereClause });
    const totalPages = Math.ceil(count / limit);

    return {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // Get single product by ID or slug
  static async getProductById(identifier) {
    const whereClause = { isActive: true };

    // Handle both numeric ID and string slug
    if (/^\d+$/.test(identifier)) {
      whereClause.id = parseInt(identifier);
    } else {
      whereClause.slug = identifier;
    }

    const product = await Product.findOne({
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
          where: { isActive: true },
          required: false,
          attributes: [
            "id",
            "name",
            "sku",
            "price",
            "salePrice",
            "stock",
            "attributes",
            "image",
          ],
        },
      ],
    });

    return product;
  }

  // Get all active categories
  static async getCategories() {
    return await Category.findAll({
      where: { isActive: true },
      order: [
        ["sortOrder", "ASC"],
        ["name", "ASC"],
      ],
      attributes: ["id", "name", "slug", "description", "image"],
    });
  }

  // Create new product
  static async createProduct(productData) {
    const product = await Product.create(productData);
    return product;
  }

  // Update existing product
  static async updateProduct(id, productData) {
    const [updatedRowsCount] = await Product.update(productData, {
      where: { id },
    });

    if (updatedRowsCount === 0) {
      throw new Error("Product not found");
    }

    return await Product.findByPk(id);
  }

  // Delete product
  static async deleteProduct(id) {
    const deletedRowsCount = await Product.destroy({
      where: { id },
    });

    if (deletedRowsCount === 0) {
      throw new Error("Product not found");
    }

    return { success: true };
  }

  // Helper to build sorting order
  static buildOrderClause(sort, order) {
    switch (sort) {
      case "name":
        return [["name", order.toUpperCase()]];
      case "price":
        return [["basePrice", order.toUpperCase()]];
      case "popularity":
        return [["id", "DESC"]]; // Using ID as popularity proxy
      default:
        return [["id", order.toUpperCase()]]; // Default to ID sorting
    }
  }
}

module.exports = ProductService;
