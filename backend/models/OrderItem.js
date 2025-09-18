const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "orders",
        key: "id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "product_variants",
        key: "id",
      },
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false, // Store product name at time of order
    },
    variantName: {
      type: DataTypes.STRING(255),
      allowNull: true, // Store variant name at time of order
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "order_items",
    hooks: {
      beforeCreate: (item) => {
        item.total = item.quantity * item.price;
      },
      beforeUpdate: (item) => {
        if (item.changed("quantity") || item.changed("price")) {
          item.total = item.quantity * item.price;
        }
      },
    },
  }
);

module.exports = OrderItem;
