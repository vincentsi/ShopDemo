#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

console.log("🗄️  Réinitialisation de la base de données...\n");

try {
  // Supprimer et recréer la base de données
  console.log("1. Suppression de l'ancienne base de données...");
  execSync('mysql -u root -p132025 -e "DROP DATABASE IF EXISTS shopdemo;"', {
    stdio: "inherit",
  });

  console.log("2. Création de la nouvelle base de données...");
  execSync(
    'mysql -u root -p132025 -e "CREATE DATABASE shopdemo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"',
    { stdio: "inherit" }
  );

  console.log("3. Import du schéma...");
  execSync("mysql -u root -p132025 shopdemo < database/schema.sql", {
    stdio: "inherit",
  });

  console.log("4. Import des données de démo...");
  execSync("mysql -u root -p132025 shopdemo < database/demo-data.sql", {
    stdio: "inherit",
  });

  console.log("\n✅ Base de données réinitialisée avec succès !");
  console.log("\n👤 Comptes disponibles :");
  console.log("   Admin: admin@shopdemo.com / admin123");
  console.log("   User:  user@shopdemo.com / user123");
  console.log("   John:  john.doe@example.com / password123");
  console.log("   Jane:  jane.smith@example.com / password123");
} catch (error) {
  console.error("❌ Erreur lors de la réinitialisation:", error.message);
  process.exit(1);
}
