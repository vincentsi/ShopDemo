-- Données de démonstration pour ShopDemo
-- À exécuter après le schéma principal

USE shopdemo;

-- Ajouter des catégories
INSERT INTO categories (name, slug, description) VALUES
('Électronique', 'electronique', 'Smartphones, tablettes, accessoires'),
('Vêtements', 'vetements', 'Mode et accessoires'),
('Maison', 'maison', 'Mobilier et décoration'),
('Sport', 'sport', 'Équipements sportifs'),
('Livres', 'livres', 'Romans, guides, manuels');

-- Ajouter des produits de démonstration
INSERT INTO products (name, slug, description, short_description, category_id, base_price, sale_price, sku, is_featured, status) VALUES
('Samsung Galaxy S24', 'samsung-galaxy-s24', 'Le dernier smartphone Samsung avec IA intégrée', 'Samsung Galaxy S24 - Innovation et performance', 1, 899.00, 799.00, 'SGS24', TRUE, 'active'),
('iPad Air M2', 'ipad-air-m2', 'Tablette Apple avec puce M2 et écran Liquid Retina', 'iPad Air M2 - Créativité sans limites', 1, 699.00, NULL, 'IPA-M2', TRUE, 'active'),
('AirPods Pro 2', 'airpods-pro-2', 'Écouteurs sans fil avec réduction de bruit active', 'AirPods Pro 2 - Son immersif', 1, 279.00, 249.00, 'APP2', FALSE, 'active'),
('Jeans Premium', 'jeans-premium', 'Jeans en denim bio de qualité supérieure', 'Jeans confortable et durable', 2, 79.99, 59.99, 'JEAN-PREM', FALSE, 'active'),
('Sweat à Capuche', 'sweat-capuche', 'Sweat-shirt confortable en coton bio', 'Sweat-shirt pour tous les jours', 2, 49.99, NULL, 'SWEAT-HOOD', FALSE, 'active'),
('Canapé 3 Places', 'canape-3-places', 'Canapé moderne et confortable pour votre salon', 'Canapé design pour votre intérieur', 3, 899.99, 749.99, 'CANAPE-3P', TRUE, 'active'),
('Vélo de Route', 'velo-route', 'Vélo de route professionnel, carbone', 'Vélo de route pour la performance', 4, 1299.99, 1099.99, 'VELO-ROUTE', TRUE, 'active'),
('Roman Policier', 'roman-policier', 'Roman policier captivant de l\'auteur à succès', 'Suspense et intrigue garantis', 5, 16.99, 12.99, 'ROMAN-POL', FALSE, 'active');

-- Ajouter des utilisateurs de démonstration
INSERT INTO users (email, password, first_name, last_name, role) VALUES
('user@shopdemo.com', 'user123', 'User', 'Demo', 'user'),
('john.doe@example.com', 'password123', 'John', 'Doe', 'user'),
('jane.smith@example.com', 'password123', 'Jane', 'Smith', 'user');