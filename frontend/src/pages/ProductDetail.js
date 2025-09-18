import {
  HeartIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { productService } from "../services/productService";
import { useCartStore } from "../store/cartStore";

const ProductDetail = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

  // State management
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch product data
  const { data, isLoading, error } = useQuery(
    ["product", identifier],
    () => productService.getProduct(identifier),
    {
      onSuccess: (data) => {
        const product = data.data.product;
        // Auto-select first variant if available
        if (product.variants && product.variants.length > 0) {
          setSelectedVariant(product.variants[0]);
        }
      },
    }
  );

  const product = data?.data?.product;

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);

    try {
      const variantId =
        product.variants && product.variants.length > 0
          ? selectedVariant?.id
          : null;

      // Check variant selection for products with variants
      if (product.variants && product.variants.length > 0 && !selectedVariant) {
        toast.error("Veuillez sélectionner une variante");
        return;
      }

      const result = await addToCart(product.id, variantId, quantity);

      if (result.success) {
        toast.success("Produit ajouté au panier !");
      } else {
        toast.error(result.error || "Erreur lors de l'ajout au panier");
      }
    } catch (error) {
      toast.error("Erreur lors de l'ajout au panier");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  // Price formatting helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Get current price (variant or product)
  const getCurrentPrice = () => {
    if (selectedVariant) {
      return (
        selectedVariant.salePrice || selectedVariant.price || product.basePrice
      );
    }
    return product.salePrice || product.basePrice;
  };

  // Check if item is on sale
  const isOnSale = () => {
    if (selectedVariant) {
      return (
        selectedVariant.salePrice &&
        selectedVariant.price &&
        selectedVariant.salePrice < selectedVariant.price
      );
    }
    return product.salePrice && product.salePrice < product.basePrice;
  };

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (selectedVariant && selectedVariant.salePrice && selectedVariant.price) {
      return Math.round(
        ((selectedVariant.price - selectedVariant.salePrice) /
          selectedVariant.price) *
          100
      );
    }
    if (product.salePrice && product.basePrice) {
      return Math.round(
        ((product.basePrice - product.salePrice) / product.basePrice) * 100
      );
    }
    return 0;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error or not found state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Produit non trouvé
          </h2>
          <p className="text-gray-600 mb-4">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <button onClick={() => navigate("/products")} className="btn-primary">
            Voir tous les produits
          </button>
        </div>
      </div>
    );
  }

  // Prepare data for rendering
  const images = product.images || [
    "https://via.placeholder.com/600x600?text=No+Image",
  ];
  const currentPrice = getCurrentPrice();
  const discountPercentage = getDiscountPercentage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <button
                onClick={() => navigate("/")}
                className="hover:text-gray-700"
              >
                Accueil
              </button>
            </li>
            <li>/</li>
            <li>
              <button
                onClick={() => navigate("/products")}
                className="hover:text-gray-700"
              >
                Produits
              </button>
            </li>
            {product.category && (
              <>
                <li>/</li>
                <li>
                  <button
                    onClick={() =>
                      navigate(`/products?category=${product.category.slug}`)
                    }
                    className="hover:text-gray-700"
                  >
                    {product.category.name}
                  </button>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-md border-2 overflow-hidden ${
                      selectedImage === index
                        ? "border-primary-500"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              {product.category && (
                <p className="text-sm text-primary-600 mb-2">
                  {product.category.name}
                </p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      className="h-5 w-5 text-yellow-400"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  (4.5) • 128 avis
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(currentPrice)}
                </span>
                {isOnSale() && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(selectedVariant?.price || product.basePrice)}
                    </span>
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                      -{discountPercentage}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Options disponibles
                </h3>
                <div className="space-y-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`w-full text-left p-3 border rounded-md ${
                        selectedVariant?.id === variant.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">
                            {variant.name}
                          </p>
                          {variant.attributes && (
                            <p className="text-sm text-gray-600">
                              {Object.entries(variant.attributes)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(
                              variant.salePrice ||
                                variant.price ||
                                product.basePrice
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            Stock: {variant.stock}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Quantité
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={
                  isAddingToCart ||
                  (selectedVariant && selectedVariant.stock === 0)
                }
                className="flex-1 btn-primary btn-lg flex items-center justify-center space-x-2"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>
                  {isAddingToCart
                    ? "Ajout..."
                    : selectedVariant && selectedVariant.stock === 0
                    ? "Rupture de stock"
                    : "Ajouter au panier"}
                </span>
              </button>

              <button
                onClick={handleToggleFavorite}
                className="p-3 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-600" />
                )}
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <div className="prose prose-sm text-gray-600">
                  <p>{product.description}</p>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Caractéristiques
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {product.sku && (
                  <div>
                    <span className="font-medium text-gray-900">
                      Référence:
                    </span>
                    <span className="ml-2 text-gray-600">{product.sku}</span>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <span className="font-medium text-gray-900">Poids:</span>
                    <span className="ml-2 text-gray-600">
                      {product.weight} kg
                    </span>
                  </div>
                )}
                {product.category && (
                  <div>
                    <span className="font-medium text-gray-900">
                      Catégorie:
                    </span>
                    <span className="ml-2 text-gray-600">
                      {product.category.name}
                    </span>
                  </div>
                )}
                {selectedVariant && selectedVariant.stock !== undefined && (
                  <div>
                    <span className="font-medium text-gray-900">Stock:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedVariant.stock} disponible
                      {selectedVariant.stock !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
