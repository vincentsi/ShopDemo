import {
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";

const AdminOrders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demo
  const orders = [
    {
      id: 1,
      orderNumber: "ORD-001",
      customer: {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean@example.com",
      },
      total: 89.99,
      status: "delivered",
      paymentStatus: "paid",
      createdAt: "2024-01-15T10:30:00Z",
      items: [{ productName: "iPhone 15 Pro", quantity: 1, price: 89.99 }],
    },
    {
      id: 2,
      orderNumber: "ORD-002",
      customer: {
        firstName: "Marie",
        lastName: "Martin",
        email: "marie@example.com",
      },
      total: 156.5,
      status: "shipped",
      paymentStatus: "paid",
      createdAt: "2024-01-14T14:20:00Z",
      items: [{ productName: "MacBook Air M2", quantity: 1, price: 156.5 }],
    },
    {
      id: 3,
      orderNumber: "ORD-003",
      customer: {
        firstName: "Pierre",
        lastName: "Durand",
        email: "pierre@example.com",
      },
      total: 234.75,
      status: "processing",
      paymentStatus: "paid",
      createdAt: "2024-01-13T09:15:00Z",
      items: [
        { productName: "T-shirt Premium", quantity: 3, price: 78.25 },
        { productName: "Chaussures Running", quantity: 1, price: 156.5 },
      ],
    },
    {
      id: 4,
      orderNumber: "ORD-004",
      customer: {
        firstName: "Sophie",
        lastName: "Bernard",
        email: "sophie@example.com",
      },
      total: 45.99,
      status: "pending",
      paymentStatus: "pending",
      createdAt: "2024-01-12T16:45:00Z",
      items: [{ productName: "Livre de Cuisine", quantity: 2, price: 45.99 }],
    },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

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

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: "badge-warning",
      paid: "badge-success",
      failed: "badge-danger",
      refunded: "badge-gray",
    };
    return colors[status] || "badge-gray";
  };

  const getPaymentStatusText = (status) => {
    const texts = {
      pending: "En attente",
      paid: "Payé",
      failed: "Échoué",
      refunded: "Remboursé",
    };
    return texts[status] || status;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.firstName.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.lastName.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des commandes
          </h1>
          <p className="text-gray-600 mt-2">
            Suivez et gérez toutes les commandes de votre boutique
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par numéro, client..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="paid">Payé</option>
                  <option value="processing">En cours</option>
                  <option value="shipped">Expédié</option>
                  <option value="delivered">Livré</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline btn-sm flex items-center"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filtres
              </button>
              <button className="btn-outline btn-sm">Exporter CSV</button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input type="date" className="input input-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input type="date" className="input input-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant minimum
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="input input-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Articles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paiement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.items.length} article
                        {order.items.length !== 1 ? "s" : ""}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items[0]?.productName}
                        {order.items.length > 1 &&
                          ` +${order.items.length - 1} autre${
                            order.items.length - 1 !== 1 ? "s" : ""
                          }`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`badge ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {getPaymentStatusText(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-gray-400 hover:text-gray-600"
                          title="Voir"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          className="text-primary-600 hover:text-primary-900"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune commande trouvée</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de <span className="font-medium">1</span> à{" "}
            <span className="font-medium">{filteredOrders.length}</span> sur{" "}
            <span className="font-medium">{filteredOrders.length}</span>{" "}
            résultats
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Précédent
            </button>
            <button className="px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700">
              1
            </button>
            <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
