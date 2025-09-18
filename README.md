# ShopDemo - E-commerce Full-Stack

Application e-commerce complète démontrant des compétences full-stack.

## 🚀 Stack Technique

- **Frontend**: React + React Router + Context API + TailwindCSS
- **Backend**: Node.js + Express + JWT + bcrypt
- **Base de données**: MySQL
- **Paiement**: Stripe (simulé + réel)
- **Upload**: Cloudinary
- **Déploiement**: Vercel (frontend) + Render (backend)

## 📋 Features

### Utilisateur

- ✅ Authentification JWT + Social Login
- ✅ Catalogue produits avec filtres/recherche
- ✅ Panier persistant avec variantes
- ✅ Checkout Stripe
- ✅ Historique commandes

### Admin

- ✅ CRUD produits avec variantes
- ✅ Gestion commandes
- ✅ Dashboard avec stats
- ✅ Export CSV/PDF
- ✅ Upload images Cloudinary

## 🛠️ Installation

```bash
# Installer toutes les dépendances
npm run install-all

# Lancer en développement
npm run dev
```

## 📁 Structure

```
ShopDemo/
├── frontend/          # React app
├── backend/           # Node.js API
├── database/          # Schémas SQL
└── docs/             # Documentation
```

## 🔧 Configuration

1. Copier `.env.example` vers `.env` dans backend/
2. Configurer les variables d'environnement
3. Importer le schéma SQL dans MySQL
4. Lancer l'application
