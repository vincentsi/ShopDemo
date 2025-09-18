#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Configuration de ShopDemo...\n");

// Vérifier les prérequis
function checkPrerequisites() {
  console.log("📋 Vérification des prérequis...");

  try {
    execSync("node --version", { stdio: "pipe" });
    console.log("✅ Node.js détecté");
  } catch (error) {
    console.error("❌ Node.js n'est pas installé");
    process.exit(1);
  }

  try {
    execSync("npm --version", { stdio: "pipe" });
    console.log("✅ npm détecté");
  } catch (error) {
    console.error("❌ npm n'est pas installé");
    process.exit(1);
  }

  try {
    execSync("mysql --version", { stdio: "pipe" });
    console.log("✅ MySQL détecté");
  } catch (error) {
    console.error("❌ MySQL n'est pas installé ou pas dans le PATH");
    console.log("💡 Installez MySQL et assurez-vous qu'il est dans votre PATH");
  }
}

// Créer les fichiers .env
function createEnvFiles() {
  console.log("\n🔧 Création des fichiers de configuration...");

  // Backend .env
  const backendEnvPath = path.join(__dirname, "..", "backend", ".env");
  const backendEnvExample = path.join(
    __dirname,
    "..",
    "backend",
    "env.example"
  );

  if (!fs.existsSync(backendEnvPath) && fs.existsSync(backendEnvExample)) {
    fs.copyFileSync(backendEnvExample, backendEnvPath);
    console.log("✅ Fichier .env créé pour le backend");
  } else if (fs.existsSync(backendEnvPath)) {
    console.log("ℹ️  Fichier .env backend existe déjà");
  }

  // Frontend .env
  const frontendEnvPath = path.join(__dirname, "..", "frontend", ".env");
  const frontendEnvContent = `REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
`;

  if (!fs.existsSync(frontendEnvPath)) {
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log("✅ Fichier .env créé pour le frontend");
  } else {
    console.log("ℹ️  Fichier .env frontend existe déjà");
  }
}

// Installer les dépendances
function installDependencies() {
  console.log("\n📦 Installation des dépendances...");

  try {
    console.log("📦 Installation des dépendances racine...");
    execSync("npm install", {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });

    console.log("📦 Installation des dépendances backend...");
    execSync("npm install", {
      stdio: "inherit",
      cwd: path.join(__dirname, "..", "backend"),
    });

    console.log("📦 Installation des dépendances frontend...");
    execSync("npm install", {
      stdio: "inherit",
      cwd: path.join(__dirname, "..", "frontend"),
    });

    console.log("✅ Toutes les dépendances installées");
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'installation des dépendances:",
      error.message
    );
    process.exit(1);
  }
}

// Instructions pour la base de données
function databaseInstructions() {
  console.log("\n🗄️  Configuration de la base de données:");
  console.log('1. Créez une base de données MySQL nommée "shopdemo"');
  console.log("2. Importez le schéma:");
  console.log("   mysql -u root -p shopdemo < database/schema.sql");
  console.log("3. (Optionnel) Importez les données de démo:");
  console.log("   mysql -u root -p shopdemo < database/demo-data.sql");
  console.log("4. Configurez les identifiants dans backend/.env");
}

// Instructions finales
function finalInstructions() {
  console.log("\n🎉 Configuration terminée !");
  console.log("\n📝 Prochaines étapes:");
  console.log("1. Configurez votre base de données MySQL");
  console.log("2. Modifiez les variables d'environnement dans backend/.env");
  console.log("3. Lancez l'application:");
  console.log("   npm run dev");
  console.log("\n🌐 URLs:");
  console.log("   Frontend: http://localhost:3000");
  console.log("   Backend:  http://localhost:5000");
  console.log("\n👤 Comptes de démo:");
  console.log("   Admin: admin@shopdemo.com / admin123");
  console.log("   User:  user@shopdemo.com / user123");
  console.log("\n📚 Documentation: INSTALLATION.md");
}

// Fonction principale
function main() {
  try {
    checkPrerequisites();
    createEnvFiles();
    installDependencies();
    databaseInstructions();
    finalInstructions();
  } catch (error) {
    console.error("❌ Erreur lors de la configuration:", error.message);
    process.exit(1);
  }
}

// Lancer le script
if (require.main === module) {
  main();
}

module.exports = { main };
