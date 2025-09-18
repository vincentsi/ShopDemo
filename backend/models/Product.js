const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shortDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    salePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true, // {length, width, height}
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true, // Array of image URLs
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true, // Array of tags
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    metaTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    metaDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "products",
    getterMethods: {
      currentPrice() {
        return this.salePrice || this.basePrice;
      },
      isOnSale() {
        return this.salePrice && this.salePrice < this.basePrice;
      },
      discountPercentage() {
        if (!(this.salePrice && this.salePrice < this.basePrice)) return 0;
        return Math.round(
          ((this.basePrice - this.salePrice) / this.basePrice) * 100
        );
      },
    },
  }
);

module.exports = Product;
