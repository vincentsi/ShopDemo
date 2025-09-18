import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { orderService } from "../services/orderService";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "France",
      paymentMethod: "stripe",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.2; // 20% VAT
  const total = subtotal + shipping + tax;

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const orderData = {
        addressId: selectedAddress || 1, // For demo, we'll use a default address
        paymentMethod: data.paymentMethod,
      };

      const result = await orderService.createOrder(orderData);

      if (result.success) {
        toast.success("Commande passée avec succès !");

        // Clear cart
        await clearCart();

        // Redirect to order confirmation
        navigate(`/orders/${result.data.order.id}`);
      } else {
        toast.error(result.error || "Erreur lors de la commande");
      }
    } catch (error) {
      toast.error("Erreur lors de la commande");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Votre panier est vide
          </h2>
          <p className="text-gray-600 mb-4">
            Ajoutez des produits à votre panier avant de passer commande.
          </p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Voir les produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Finaliser la commande
          </h1>
          <p className="text-gray-600 mt-2">
            Vérifiez vos informations et confirmez votre commande
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations de livraison
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      {...register("firstName", {
                        required: "Le prénom est requis",
                      })}
                      type="text"
                      className={`input ${
                        errors.firstName ? "input-error" : ""
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      {...register("lastName", {
                        required: "Le nom est requis",
                      })}
                      type="text"
                      className={`input ${
                        errors.lastName ? "input-error" : ""
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    {...register("email", {
                      required: "L'email est requis",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Adresse email invalide",
                      },
                    })}
                    type="email"
                    className={`input ${errors.email ? "input-error" : ""}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input {...register("phone")} type="tel" className="input" />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    {...register("address1", {
                      required: "L'adresse est requise",
                    })}
                    type="text"
                    className={`input ${errors.address1 ? "input-error" : ""}`}
                    placeholder="Numéro et nom de rue"
                  />
                  {errors.address1 && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address1.message}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complément d'adresse
                  </label>
                  <input
                    {...register("address2")}
                    type="text"
                    className="input"
                    placeholder="Appartement, étage, etc."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                    <input
                      {...register("city", {
                        required: "La ville est requise",
                      })}
                      type="text"
                      className={`input ${errors.city ? "input-error" : ""}`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal *
                    </label>
                    <input
                      {...register("postalCode", {
                        required: "Le code postal est requis",
                      })}
                      type="text"
                      className={`input ${
                        errors.postalCode ? "input-error" : ""
                      }`}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays *
                    </label>
                    <select
                      {...register("country", {
                        required: "Le pays est requis",
                      })}
                      className={`input ${errors.country ? "input-error" : ""}`}
                    >
                      <option value="France">France</option>
                      <option value="Belgique">Belgique</option>
                      <option value="Suisse">Suisse</option>
                      <option value="Canada">Canada</option>
                    </select>
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Mode de paiement
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      {...register("paymentMethod")}
                      type="radio"
                      value="stripe"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        Carte bancaire
                      </p>
                      <p className="text-sm text-gray-600">
                        Visa, Mastercard, American Express
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      {...register("paymentMethod")}
                      type="radio"
                      value="paypal"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">PayPal</p>
                      <p className="text-sm text-gray-600">
                        Paiement sécurisé via PayPal
                      </p>
                    </div>
                  </label>
                </div>

                {paymentMethod === "stripe" && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-700">
                      🔒 Paiement sécurisé par Stripe. Vos informations de carte
                      sont cryptées.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Résumé de la commande
                </h2>

                {/* Order Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs">📦</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product?.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-gray-600">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-600">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(item.quantity * item.price)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
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

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-6 btn-primary btn-lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Traitement...
                    </div>
                  ) : (
                    `Confirmer la commande - ${formatPrice(total)}`
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  En confirmant votre commande, vous acceptez nos conditions
                  d'utilisation.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
