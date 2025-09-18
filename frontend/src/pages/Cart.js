import {
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect } from "react";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

const Cart = () => {
  const {
    items,
    subtotal,
    totalItems,
    isLoading,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCartStore();

  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }

    const result = await updateQuantity(itemId, newQuantity);
    if (!result.success) {
      toast.error(result.error || "Erreur lors de la mise à jour");
    }
  };

  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast.success("Produit retiré du panier");
    } else {
      toast.error(result.error || "Erreur lors de la suppression");
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir vider votre panier ?")) {
      const result = await clearCart();
      if (result.success) {
        toast.success("Panier vidé");
      } else {
        toast.error(result.error || "Erreur lors du vidage du panier");
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.2; // 20% VAT
  const total = subtotal + shipping + tax;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connexion requise
          </h2>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour voir votre panier.
          </p>
          <div className="space-x-4">
            <Link to="/login" className="btn-primary">
              Se connecter
            </Link>
            <Link to="/register" className="btn-outline">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h2>
            <p className="text-gray-600 mb-8">
              Découvrez nos produits et ajoutez-les à votre panier.
            </p>
            <Link to="/products" className="btn-primary btn-lg">
              Voir les produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mon Panier ({totalItems} article{totalItems !== 1 ? "s" : ""})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Articles dans votre panier
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Vider le panier
                  </button>
                </div>

                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={
                            item.product?.images?.[0] ||
                            "https://via.placeholder.com/100x100?text=No+Image"
                          }
                          alt={item.product?.name}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900">
                          <Link
                            to={`/products/${item.product?.slug}`}
                            className="hover:text-primary-600"
                          >
                            {item.product?.name}
                          </Link>
                        </h3>
                        {item.variant && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Total Price */}
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.quantity * item.price)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Résumé de la commande
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Gratuite" : formatPrice(shipping)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA (20%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="mt-4 p-3 bg-primary-50 rounded-md">
                    <p className="text-sm text-primary-700">
                      Ajoutez {formatPrice(50 - subtotal)} pour bénéficier de la
                      livraison gratuite !
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleCheckout}
                    className="w-full btn-primary btn-lg"
                  >
                    Passer la commande
                  </button>

                  <Link
                    to="/products"
                    className="w-full btn-outline btn-lg text-center block"
                  >
                    Continuer mes achats
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
