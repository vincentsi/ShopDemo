const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false // e.g., "Red - Large", "Blue - Medium"
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // if null, uses product base price
    validate: {
      min: 0
    }
  },
  salePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  attributes: {
    type: DataTypes.JSON,
    allowNull: true // {color: "red", size: "L", material: "cotton"}
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'product_variants',
  getterMethods: {
    currentPrice() {
      return this.salePrice || this.price || this.product?.basePrice || 0;
    },
    isOnSale() {
      return this.salePrice && this.price && this.salePrice < this.price;
    },
    isInStock() {
      return this.stock > 0;
    }
  }
});

module.exports = ProductVariant;
