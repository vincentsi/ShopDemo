#!/usr/bin/env node

require("dotenv").config();
const { sequelize, Category, Product, User } = require("./models");

async function initDatabase() {
  try {
    console.log("🗄️  Initialisation de la base de données...\n");

    // Synchroniser la base de données (créer les tables)
    await sequelize.sync({ force: true });
    console.log("✅ Tables créées avec Sequelize");

    // Créer un utilisateur admin
    const adminUser = await User.create({
      email: "admin@shopdemo.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });
    console.log("✅ Utilisateur admin créé");

    // Créer des catégories
    const categories = await Category.bulkCreate([
      {
        name: "Électronique",
        slug: "electronique",
        description: "Smartphones, tablettes, accessoires",
      },
      {
        name: "Vêtements",
        slug: "vetements",
        description: "Mode et accessoires",
      },
      { name: "Maison", slug: "maison", description: "Mobilier et décoration" },
      { name: "Sport", slug: "sport", description: "Équipements sportifs" },
      {
        name: "Livres",
        slug: "livres",
        description: "Romans, guides, manuels",
      },
    ]);
    console.log(`✅ ${categories.length} catégories créées`);

    // Créer des produits
    const products = await Product.bulkCreate([
      {
        name: "Samsung Galaxy S24",
        slug: "samsung-galaxy-s24",
        description: "Le dernier smartphone Samsung avec IA intégrée",
        shortDescription: "Samsung Galaxy S24 - Innovation et performance",
        basePrice: 899.0,
        salePrice: 799.0,
        sku: "SGS24",
        categoryId: categories[0].id,
        isFeatured: true,
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
        ],
        tags: ["smartphone", "samsung", "android"],
      },
      {
        name: "iPad Air M2",
        slug: "ipad-air-m2",
        description: "Tablette Apple avec puce M2 et écran Liquid Retina",
        shortDescription: "iPad Air M2 - Créativité sans limites",
        basePrice: 699.0,
        sku: "IPA-M2",
        categoryId: categories[0].id,
        isFeatured: true,
        images: [
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
        ],
        tags: ["tablette", "apple", "m2"],
      },
      {
        name: "AirPods Pro 2",
        slug: "airpods-pro-2",
        description: "Écouteurs sans fil avec réduction de bruit active",
        shortDescription: "AirPods Pro 2 - Son immersif",
        basePrice: 279.0,
        salePrice: 249.0,
        sku: "APP2",
        categoryId: categories[0].id,
        isFeatured: false,
        images: [
          "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500",
        ],
        tags: ["ecouteurs", "apple", "wireless"],
      },
      {
        name: "Jeans Premium",
        slug: "jeans-premium",
        description: "Jeans en denim bio de qualité supérieure",
        shortDescription: "Jeans confortable et durable",
        basePrice: 79.99,
        salePrice: 59.99,
        sku: "JEAN-PREM",
        categoryId: categories[1].id,
        isFeatured: false,
        images: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
        ],
        tags: ["vetement", "jeans", "denim"],
      },
      {
        name: "Sweat à Capuche",
        slug: "sweat-capuche",
        description: "Sweat-shirt confortable en coton bio",
        shortDescription: "Sweat-shirt pour tous les jours",
        basePrice: 49.99,
        sku: "SWEAT-HOOD",
        categoryId: categories[1].id,
        isFeatured: false,
        images: [
          "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
        ],
        tags: ["vetement", "sweat", "confort"],
      },
      {
        name: "Canapé 3 Places",
        slug: "canape-3-places",
        description: "Canapé moderne et confortable pour votre salon",
        shortDescription: "Canapé design pour votre intérieur",
        basePrice: 899.99,
        salePrice: 749.99,
        sku: "CANAPE-3P",
        categoryId: categories[2].id,
        isFeatured: true,
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
        ],
        tags: ["mobilier", "canape", "salon"],
      },
      {
        name: "Vélo de Route",
        slug: "velo-route",
        description: "Vélo de route professionnel, carbone",
        shortDescription: "Vélo de route pour la performance",
        basePrice: 1299.99,
        salePrice: 1099.99,
        sku: "VELO-ROUTE",
        categoryId: categories[3].id,
        isFeatured: true,
        images: [
          "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500&h=500&fit=crop",
        ],
        tags: ["sport", "velo", "route"],
      },
      {
        name: "Roman Policier",
        slug: "roman-policier",
        description: "Roman policier captivant de l'auteur à succès",
        shortDescription: "Suspense et intrigue garantis",
        basePrice: 16.99,
        salePrice: 12.99,
        sku: "ROMAN-POL",
        categoryId: categories[4].id,
        isFeatured: false,
        images: [
          "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500",
        ],
        tags: ["livre", "roman", "policier"],
      },
    ]);
    console.log(`✅ ${products.length} produits créés`);

    // Créer des utilisateurs de démo
    const demoUsers = await User.bulkCreate([
      {
        email: "user@shopdemo.com",
        password: "user123",
        firstName: "User",
        lastName: "Demo",
        role: "user",
      },
      {
        email: "john.doe@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: "user",
      },
      {
        email: "jane.smith@example.com",
        password: "password123",
        firstName: "Jane",
        lastName: "Smith",
        role: "user",
      },
    ]);
    console.log(`✅ ${demoUsers.length} utilisateurs de démo créés`);

    await sequelize.close();
    console.log("\n✅ Base de données initialisée avec succès !");
    console.log("\n👤 Comptes disponibles :");
    console.log("   Admin: admin@shopdemo.com / admin123");
    console.log("   User:  user@shopdemo.com / user123");
    console.log("   John:  john.doe@example.com / password123");
    console.log("   Jane:  jane.smith@example.com / password123");
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
}

initDatabase();
