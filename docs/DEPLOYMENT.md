# Guide de Déploiement - ShopDemo

Ce guide vous accompagne dans le déploiement de ShopDemo en production.

## 🚀 Déploiement Rapide

### Option 1: Déploiement Automatique (Recommandé)

#### Frontend sur Vercel

1. **Connecter le repository**

   - Allez sur [Vercel](https://vercel.com)
   - Connectez votre compte GitHub
   - Importez le repository ShopDemo

2. **Configuration**

   - Framework Preset: `Create React App`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

3. **Variables d'environnement**
   ```
   REACT_APP_API_URL=https://votre-backend.herokuapp.com/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_votre_stripe_key
   ```

#### Backend sur Render

1. **Connecter le repository**

   - Allez sur [Render](https://render.com)
   - Connectez votre compte GitHub
   - Créez un nouveau Web Service

2. **Configuration**

   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Variables d'environnement**
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=votre-host-mysql
   DB_NAME=shopdemo
   DB_USER=votre-user
   DB_PASSWORD=votre-password
   JWT_SECRET=votre-secret-jwt
   STRIPE_SECRET_KEY=sk_live_votre_stripe_key
   FRONTEND_URL=https://votre-frontend.vercel.app
   ```

#### Base de données sur PlanetScale

1. **Créer la base**

   - Allez sur [PlanetScale](https://planetscale.com)
   - Créez une nouvelle base de données
   - Nommez-la `shopdemo`

2. **Importer le schéma**
   ```bash
   # Récupérer l'URL de connexion depuis PlanetScale
   mysql -h your-host -u your-user -p shopdemo < database/schema.sql
   ```

### Option 2: Déploiement Manuel

#### Préparation

1. **Build du frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Variables d'environnement**
   - Configurez toutes les variables de production
   - Utilisez des secrets forts pour JWT
   - Configurez les vraies clés Stripe

#### Serveur VPS

1. **Installation des dépendances**

   ```bash
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # MySQL
   sudo apt-get install mysql-server

   # Nginx
   sudo apt-get install nginx
   ```

2. **Configuration Nginx**

   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com;

       # Frontend
       location / {
           root /var/www/shopdemo/frontend/build;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **PM2 pour le backend**
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name "shopdemo-api"
   pm2 startup
   pm2 save
   ```

## 🔐 Sécurité en Production

### Variables d'environnement critiques

```env
# JWT - Utilisez des secrets très forts
JWT_SECRET=un-secret-tres-long-et-complexe-256-bits-minimum
JWT_REFRESH_SECRET=un-autre-secret-different-et-complexe

# Base de données - Utilisez des utilisateurs dédiés
DB_USER=shopdemo_user
DB_PASSWORD=mot-de-passe-tres-securise

# Stripe - Utilisez les clés live
STRIPE_SECRET_KEY=sk_live_votre_vraie_cle_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret

# CORS - Limitez aux domaines autorisés
FRONTEND_URL=https://votre-domaine.com
```

### Configuration HTTPS

1. **Certificat SSL**

   ```bash
   # Let's Encrypt avec Certbot
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d votre-domaine.com
   ```

2. **Redirection HTTP vers HTTPS**
   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com;
       return 301 https://$server_name$request_uri;
   }
   ```

### Sécurité supplémentaire

1. **Rate Limiting**

   - Configuré dans le backend avec `express-rate-limit`
   - Limite: 100 requêtes par 15 minutes par IP

2. **CORS**

   - Limité aux domaines autorisés
   - Credentials activés pour les cookies

3. **Helmet**
   - Headers de sécurité automatiques
   - Protection XSS, CSRF, etc.

## 📊 Monitoring et Logs

### Logs d'application

```bash
# PM2 logs
pm2 logs shopdemo-api

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Monitoring avec PM2

```bash
# Status des processus
pm2 status

# Monitoring en temps réel
pm2 monit

# Redémarrage automatique
pm2 restart shopdemo-api
```

### Base de données

```sql
-- Vérifier les connexions
SHOW PROCESSLIST;

-- Vérifier l'espace disque
SELECT
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'shopdemo'
GROUP BY table_schema;
```

## 🔄 Mises à jour

### Processus de mise à jour

1. **Backup de la base de données**

   ```bash
   mysqldump -u root -p shopdemo > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Mise à jour du code**

   ```bash
   git pull origin main
   cd backend && npm install
   cd ../frontend && npm install && npm run build
   ```

3. **Redémarrage des services**
   ```bash
   pm2 restart shopdemo-api
   sudo systemctl reload nginx
   ```

### Rollback

```bash
# Restaurer la base de données
mysql -u root -p shopdemo < backup_20240115_143022.sql

# Revenir à une version précédente
git checkout v1.0.0
pm2 restart shopdemo-api
```

## 📈 Performance

### Optimisations

1. **Frontend**

   - Build de production avec optimisations
   - Compression gzip activée
   - CDN pour les assets statiques

2. **Backend**

   - Compression activée
   - Cache des requêtes fréquentes
   - Pool de connexions MySQL optimisé

3. **Base de données**
   - Index sur les colonnes fréquemment utilisées
   - Requêtes optimisées
   - Monitoring des performances

### Cache

```javascript
// Redis pour le cache (optionnel)
const redis = require("redis");
const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

// Cache des produits populaires
app.get("/api/products/featured", cache(300), (req, res) => {
  // 5 minutes de cache
});
```

## 🚨 Dépannage

### Problèmes courants

1. **Erreur 502 Bad Gateway**

   - Vérifiez que le backend est démarré
   - Vérifiez les logs PM2
   - Vérifiez la configuration Nginx

2. **Erreurs de base de données**

   - Vérifiez les connexions MySQL
   - Vérifiez les credentials
   - Vérifiez l'espace disque

3. **Problèmes de CORS**
   - Vérifiez FRONTEND_URL
   - Vérifiez la configuration CORS
   - Vérifiez les headers

### Commandes utiles

```bash
# Vérifier les ports utilisés
sudo netstat -tlnp | grep :5000

# Vérifier les processus Node
ps aux | grep node

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h
```

## 📞 Support

En cas de problème :

1. Vérifiez les logs
2. Consultez la documentation
3. Vérifiez la configuration
4. Contactez le support technique

---

**Bon déploiement ! 🚀**
