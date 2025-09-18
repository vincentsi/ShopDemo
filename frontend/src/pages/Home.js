import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import ProductCard from "../components/products/ProductCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { productService } from "../services/productService";

const Home = () => {
  // Fetch featured products
  const { data: featuredData, isLoading: featuredLoading } = useQuery(
    "featured-products",
    () => productService.getFeaturedProducts(8),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    "categories",
    productService.getCategories,
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const featuredProducts = featuredData?.data?.products || [];
  const categories = categoriesData?.data?.categories || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenue sur <span className="text-primary-200">ShopDemo</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Découvrez une expérience d'achat exceptionnelle avec notre large
              gamme de produits de qualité
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 px-8 py-3"
              >
                Voir tous les produits
              </Link>
              <Link
                to="/products?featured=true"
                className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3"
              >
                Produits vedettes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explorez nos catégories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trouvez exactement ce que vous cherchez dans nos différentes
              catégories de produits
            </p>
          </div>

          {categoriesLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.slug}`}
                  className="group text-center"
                >
                  <div className="bg-gray-100 rounded-lg p-6 group-hover:bg-primary-50 transition-colors">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Produits vedettes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez nos produits les plus populaires et les mieux notés
            </p>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/products?featured=true" className="btn-primary btn-lg">
              Voir tous les produits vedettes
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir ShopDemo ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nous nous engageons à vous offrir la meilleure expérience d'achat
              possible
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Livraison rapide
              </h3>
              <p className="text-gray-600">
                Livraison gratuite pour les commandes de plus de 50€. Recevez
                vos produits en 24-48h.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Paiement sécurisé
              </h3>
              <p className="text-gray-600">
                Vos données sont protégées avec un cryptage SSL. Paiement 100%
                sécurisé.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Support client
              </h3>
              <p className="text-gray-600">
                Notre équipe est là pour vous aider 7j/7. Réponse garantie sous
                24h.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
