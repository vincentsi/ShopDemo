# Guide d'Installation - ShopDemo

Ce guide vous accompagne dans l'installation et la configuration de ShopDemo, votre application e-commerce full-stack.

## 📋 Prérequis

- **Node.js** (version 18 ou supérieure)
- **MySQL** (version 8.0 ou supérieure)
- **npm** ou **yarn**
- **Git**

## 🚀 Installation Rapide

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd ShopDemo
```

### 2. Installer les dépendances

```bash
# Installer toutes les dépendances (frontend + backend)
npm run install-all
```

### 3. Configuration de la base de données

#### Créer la base de données MySQL

```sql
CREATE DATABASE shopdemo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Importer le schéma

```bash
mysql -u root -p shopdemo < database/schema.sql
```

### 4. Configuration des variables d'environnement

#### Backend

```bash
cd backend
cp env.example .env
```

Éditez le fichier `.env` avec vos paramètres :

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shopdemo
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql

# JWT
JWT_SECRET=votre_super_secret_jwt_key_ici
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=votre_refresh_secret_ici
JWT_REFRESH_EXPIRE=30d

# Stripe (optionnel pour la démo)
STRIPE_SECRET_KEY=sk_test_votre_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_votre_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret

# Cloudinary (optionnel)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend

```bash
cd frontend
```

Créez un fichier `.env` :

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_votre_stripe_publishable_key
```

### 5. Lancer l'application

```bash
# Depuis la racine du projet
npm run dev
```

L'application sera accessible sur :

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000

## 🔧 Configuration Détaillée

### Base de données

Le schéma SQL inclut :

- Tables utilisateurs, produits, commandes
- Données de démonstration
- Compte admin par défaut

**Compte admin par défaut :**

- Email : `admin@shopdemo.com`
- Mot de passe : `admin123`

### Services Externes (Optionnels)

#### Stripe (Paiements)

1. Créez un compte sur [Stripe](https://stripe.com)
2. Récupérez vos clés API dans le dashboard
3. Ajoutez-les dans le fichier `.env` du backend

#### Cloudinary (Images)

1. Créez un compte sur [Cloudinary](https://cloudinary.com)
2. Récupérez vos identifiants
3. Ajoutez-les dans le fichier `.env` du backend

## 🧪 Tests

### Lancer les tests backend

```bash
cd backend
npm test
```

### Lancer les tests frontend

```bash
cd frontend
npm test
```

## 📦 Déploiement

### Backend (Render/Heroku)

1. Connectez votre repo GitHub
2. Configurez les variables d'environnement
3. Déployez

### Frontend (Vercel/Netlify)

1. Connectez votre repo GitHub
2. Configurez les variables d'environnement
3. Déployez

### Base de données (Production)

Utilisez un service comme :

- **PlanetScale** (MySQL serverless)
- **Railway** (MySQL)
- **AWS RDS** (MySQL)

## 🐛 Dépannage

### Erreurs courantes

#### "Cannot connect to database"

- Vérifiez que MySQL est démarré
- Vérifiez les identifiants dans `.env`
- Vérifiez que la base `shopdemo` existe

#### "JWT_SECRET is required"

- Ajoutez `JWT_SECRET` dans votre fichier `.env`
- Utilisez une chaîne aléatoire sécurisée

#### "Module not found"

- Relancez `npm run install-all`
- Vérifiez que vous êtes dans le bon répertoire

### Logs

#### Backend

```bash
cd backend
npm run dev
# Les logs apparaissent dans la console
```

#### Frontend

```bash
cd frontend
npm start
# Ouvrez les DevTools du navigateur
```

## 📚 Structure du Projet

```
ShopDemo/
├── backend/                 # API Node.js
│   ├── config/             # Configuration DB
│   ├── middleware/         # Middlewares Express
│   ├── models/            # Modèles Sequelize
│   ├── routes/            # Routes API
│   └── server.js          # Point d'entrée
├── frontend/              # App React
│   ├── public/           # Fichiers statiques
│   ├── src/
│   │   ├── components/   # Composants React
│   │   ├── pages/        # Pages de l'app
│   │   ├── services/     # Services API
│   │   ├── store/        # Store Zustand
│   │   └── utils/        # Utilitaires
│   └── package.json
├── database/             # Schémas SQL
└── docs/                # Documentation
```

## 🔐 Sécurité

### Variables d'environnement

- Ne commitez jamais vos fichiers `.env`
- Utilisez des secrets forts pour JWT
- Limitez l'accès à votre base de données

### Production

- Activez HTTPS
- Configurez CORS correctement
- Utilisez un reverse proxy (Nginx)
- Activez la rate limiting

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez ce guide
2. Consultez les logs d'erreur
3. Vérifiez la configuration
4. Créez une issue sur GitHub

## 🎯 Prochaines Étapes

Une fois l'installation terminée :

1. **Testez l'application** avec les comptes de démo
2. **Configurez Stripe** pour les vrais paiements
3. **Ajoutez vos produits** via l'interface admin
4. **Personnalisez** le design selon vos besoins
5. **Déployez** en production

---

**Bon développement ! 🚀**
