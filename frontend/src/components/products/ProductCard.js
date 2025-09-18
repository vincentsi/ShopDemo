import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import React from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";

const ProductCard = ({ product, showAddToCart = true }) => {
  const { addToCart } = useCartStore();
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToCart(true);

    try {
      // If product has variants, redirect to product page
      if (product.variants && product.variants.length > 0) {
        return;
      }

      const result = await addToCart(product.id, null, 1);

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

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  const getMainImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return "https://via.placeholder.com/300x300?text=No+Image";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const currentPrice = product.salePrice || product.basePrice;
  const isOnSale = product.salePrice && product.salePrice < product.basePrice;
  const discountPercentage = isOnSale
    ? Math.round(
        ((product.basePrice - product.salePrice) / product.basePrice) * 100
      )
    : 0;

  return (
    <div className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/products/${product.slug}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={getMainImage()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Sale Badge */}
          {isOnSale && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              -{discountPercentage}%
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors"
          >
            {isFavorite ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            {product.variants && product.variants.length > 0 ? (
              <span className="bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium">
                Voir les options
              </span>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                <span>{isAddingToCart ? "Ajout..." : "Ajouter"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 mb-1">
              {product.category.name}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.shortDescription}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(currentPrice)}
              </span>
              {isOnSale && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.basePrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            {product.variants && product.variants.length > 0 ? (
              <span className="text-xs text-gray-500">
                {product.variants.some((v) => v.stock > 0)
                  ? "En stock"
                  : "Rupture"}
              </span>
            ) : (
              <span className="text-xs text-gray-500">En stock</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button - Mobile */}
      {showAddToCart && product.variants && product.variants.length === 0 && (
        <div className="p-4 pt-0">
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full btn-primary btn-sm flex items-center justify-center space-x-2"
          >
            <ShoppingCartIcon className="h-4 w-4" />
            <span>{isAddingToCart ? "Ajout..." : "Ajouter au panier"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
