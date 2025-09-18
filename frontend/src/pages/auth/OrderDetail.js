import React from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { orderService } from "../../services/orderService";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery(
    ["order", id],
    () => orderService.getOrder(id),
    {
      enabled: !!id,
    }
  );

  const order = data?.data?.order;

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
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Commande non trouvée
          </h2>
          <p className="text-gray-600 mb-4">
            Cette commande n'existe pas ou vous n'avez pas l'autorisation de la
            voir.
          </p>
          <button onClick={() => navigate("/orders")} className="btn-primary">
            Retour aux commandes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/orders")}
            className="text-primary-600 hover:text-primary-700 mb-4"
          >
            ← Retour aux commandes
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Commande #{order.orderNumber}
          </h1>
          <p className="text-gray-600 mt-2">
            Passée le {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                État de la commande
              </h2>
              <div className="flex items-center justify-between">
                <span className={`badge ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Articles commandés
              </h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.productName}
                        {item.variantName && ` - ${item.variantName}`}
                      </h3>
                      {item.sku && (
                        <p className="text-sm text-gray-600">
                          Référence: {item.sku}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(item.price)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: {formatPrice(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.address && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Adresse de livraison
                </h2>
                <div className="text-gray-600">
                  <p className="font-medium">
                    {order.address.firstName} {order.address.lastName}
                  </p>
                  {order.address.company && <p>{order.address.company}</p>}
                  <p>{order.address.address1}</p>
                  {order.address.address2 && <p>{order.address.address2}</p>}
                  <p>
                    {order.address.postalCode} {order.address.city}
                  </p>
                  <p>
                    {order.address.state}, {order.address.country}
                  </p>
                  {order.address.phone && (
                    <p className="mt-2">Tél: {order.address.phone}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Résumé de la commande
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">
                    {order.shipping === 0
                      ? "Gratuite"
                      : formatPrice(order.shipping)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span className="font-medium">{formatPrice(order.tax)}</span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remise</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(order.discount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Paiement
                </h3>
                <p className="text-sm text-gray-600">
                  Méthode: {order.paymentMethod || "Non spécifiée"}
                </p>
                <p className="text-sm text-gray-600">
                  Statut: {order.paymentStatus || "Non spécifié"}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                {["pending", "paid"].includes(order.status) && (
                  <button className="w-full btn-danger btn-sm">
                    Annuler la commande
                  </button>
                )}

                <button className="w-full btn-outline btn-sm">
                  Télécharger la facture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
