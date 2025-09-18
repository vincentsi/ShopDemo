import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { orderService } from "../../services/orderService";

const Orders = () => {
  const { data, isLoading, error } = useQuery(
    "user-orders",
    () => orderService.getOrders({ limit: 20 }),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || {};

  const getStatusColor = (status) => {
    const colors = {
      pending: "badge-warning",
      paid: "badge-primary",
      processing: "badge-primary",
      shipped: "badge-primary",
      delivered: "badge-success",
      cancelled: "badge-danger",
      refunded: "badge-gray",
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
      refunded: "Remboursé",
    };
    return texts[status] || status;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur lors du chargement
          </h2>
          <p className="text-gray-600 mb-4">
            Impossible de charger vos commandes. Veuillez réessayer.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Commandes</h1>
          <p className="text-gray-600 mt-2">
            Suivez l'état de vos commandes et accédez à l'historique
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune commande
            </h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore passé de commande.
            </p>
            <Link to="/products" className="btn-primary">
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Commande #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Passée le {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex items-center space-x-4">
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Articles</p>
                      <p className="font-medium">{order.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sous-total</p>
                      <p className="font-medium">
                        {formatPrice(order.subtotal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Livraison</p>
                      <p className="font-medium">
                        {order.shipping === 0
                          ? "Gratuite"
                          : formatPrice(order.shipping)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">TVA</p>
                      <p className="font-medium">{formatPrice(order.tax)}</p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Articles commandés
                      </h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-3 text-sm"
                          >
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-xs">📦</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {item.productName}
                                {item.variantName && ` - ${item.variantName}`}
                              </p>
                              <p className="text-gray-600">
                                Quantité: {item.quantity} •{" "}
                                {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-sm text-gray-600 ml-11">
                            +{order.items.length - 3} autre
                            {order.items.length - 3 !== 1 ? "s" : ""} article
                            {order.items.length - 3 !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
                    <div className="mb-2 sm:mb-0">
                      {order.address && (
                        <p className="text-sm text-gray-600">
                          Livraison: {order.address.city},{" "}
                          {order.address.country}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        to={`/orders/${order.id}`}
                        className="btn-outline btn-sm"
                      >
                        Voir les détails
                      </Link>
                      {["pending", "paid"].includes(order.status) && (
                        <button className="btn-danger btn-sm">Annuler</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>

                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((pageNum) => (
                    <button
                      key={pageNum}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pageNum === pagination.currentPage
                          ? "bg-primary-600 text-white"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
