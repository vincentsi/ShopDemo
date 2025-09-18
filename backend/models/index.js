const { sequelize } = require("../config/database");

// Import models
const User = require("./User");
const Product = require("./Product");
const ProductVariant = require("./ProductVariant");
const Category = require("./Category");
const Cart = require("./Cart");
const CartItem = require("./CartItem");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Address = require("./Address");

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Address, { foreignKey: "user_id", as: "addresses" });
  User.hasMany(Cart, { foreignKey: "user_id", as: "carts" });
  User.hasMany(Order, { foreignKey: "user_id", as: "orders" });

  // Product associations
  Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });
  Product.hasMany(ProductVariant, { foreignKey: "product_id", as: "variants" });
  Product.hasMany(CartItem, { foreignKey: "product_id", as: "cartItems" });
  Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });

  // Category associations
  Category.hasMany(Product, { foreignKey: "category_id", as: "products" });

  // ProductVariant associations
  ProductVariant.belongsTo(Product, {
    foreignKey: "product_id",
    as: "product",
  });
  ProductVariant.hasMany(CartItem, {
    foreignKey: "variant_id",
    as: "cartItems",
  });
  ProductVariant.hasMany(OrderItem, {
    foreignKey: "variant_id",
    as: "orderItems",
  });

  // Cart associations
  Cart.belongsTo(User, { foreignKey: "user_id", as: "user" });
  Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items" });

  // CartItem associations
  CartItem.belongsTo(Cart, { foreignKey: "cart_id", as: "cart" });
  CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
  CartItem.belongsTo(ProductVariant, {
    foreignKey: "variant_id",
    as: "variant",
  });

  // Order associations
  Order.belongsTo(User, { foreignKey: "user_id", as: "user" });
  Order.belongsTo(Address, { foreignKey: "address_id", as: "address" });
  Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });

  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
  OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
  OrderItem.belongsTo(ProductVariant, {
    foreignKey: "variant_id",
    as: "variant",
  });

  // Address associations
  Address.belongsTo(User, { foreignKey: "user_id", as: "user" });
  Address.hasMany(Order, { foreignKey: "address_id", as: "orders" });
};

// Initialize associations
defineAssociations();

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log("✅ Database synchronized successfully.");
  } catch (error) {
    console.error("❌ Error synchronizing database:", error);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Product,
  ProductVariant,
  Category,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Address,
};
