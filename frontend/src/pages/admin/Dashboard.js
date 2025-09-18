import {
  CubeIcon,
  CurrencyEuroIcon,
  ShoppingCartIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  // Mock data for demo - in real app, this would come from API
  const stats = {
    totalOrders: 1247,
    totalRevenue: 45678.9,
    totalProducts: 89,
    totalUsers: 2341,
  };

  const recentOrders = [
    {
      id: 1,
      orderNumber: "ORD-001",
      customer: "Jean Dupont",
      total: 89.99,
      status: "delivered",
      date: "2024-01-15",
    },
    {
      id: 2,
      orderNumber: "ORD-002",
      customer: "Marie Martin",
      total: 156.5,
      status: "shipped",
      date: "2024-01-14",
    },
    {
      id: 3,
      orderNumber: "ORD-003",
      customer: "Pierre Durand",
      total: 234.75,
      status: "processing",
      date: "2024-01-13",
    },
  ];

  const topProducts = [
    { name: "iPhone 15 Pro", sales: 45, revenue: 53955 },
    { name: "MacBook Air M2", sales: 23, revenue: 29877 },
    { name: "T-shirt Premium", sales: 156, revenue: 3899 },
    { name: "Chaussures Running", sales: 89, revenue: 8009 },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "badge-warning",
      paid: "badge-primary",
      processing: "badge-primary",
      shipped: "badge-primary",
      delivered: "badge-success",
      cancelled: "badge-danger",
    };
    return colors[status] || "badge-gray";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "En attente",
      paid: "Payé",
      processing: "En cours",
      shipped: "Expédié",
      delivered: "Livré",
      cancelled: "Annulé",
    };
    return texts[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">
            Vue d'ensemble de votre boutique en ligne
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commandes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CurrencyEuroIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Chiffre d'affaires
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <CubeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <UserGroupIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Utilisateurs
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Commandes récentes
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Voir toutes les commandes →
                </button>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Produits les plus vendus
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.sales} ventes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Voir tous les produits →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/products/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
            >
              <div className="text-2xl mb-2">➕</div>
              <p className="font-medium text-gray-900">Ajouter un produit</p>
              <p className="text-sm text-gray-600">Créer un nouveau produit</p>
            </Link>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-gray-900">Voir les statistiques</p>
              <p className="text-sm text-gray-600">Analyses détaillées</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-2xl mb-2">📦</div>
              <p className="font-medium text-gray-900">Gérer les commandes</p>
              <p className="text-sm text-gray-600">Suivre les expéditions</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <div className="text-2xl mb-2">👥</div>
              <p className="font-medium text-gray-900">
                Gérer les utilisateurs
              </p>
              <p className="text-sm text-gray-600">Administration</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
