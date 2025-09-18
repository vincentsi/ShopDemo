import { FunnelIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductCard from "../components/products/ProductCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { productService } from "../services/productService";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get current filters from URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") || "DESC";
  const page = parseInt(searchParams.get("page")) || 1;

  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);

  // Fetch products
  const { data, isLoading, error } = useQuery(
    ["products", { search, category, minPrice, maxPrice, sort, order, page }],
    () =>
      productService.getProducts({
        search,
        category,
        minPrice,
        maxPrice,
        sort,
        order,
        page,
        limit: 12,
      }),
    {
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Fetch categories
  const { data: categoriesData } = useQuery(
    "categories",
    productService.getCategories,
    {
      staleTime: 10 * 60 * 1000,
    }
  );

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination || {};
  const categories = categoriesData?.data?.categories || [];

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localSearch.trim()) {
      newParams.set("search", localSearch.trim());
    } else {
      newParams.delete("search");
    }
    newParams.delete("page"); // Reset to first page
    setSearchParams(newParams);
  };

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete("page"); // Reset to first page
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", newSort);
    newParams.set("order", order === "ASC" ? "DESC" : "ASC");
    newParams.delete("page");
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setLocalSearch("");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur lors du chargement
          </h2>
          <p className="text-gray-600 mb-4">
            Impossible de charger les produits. Veuillez réessayer.
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {search ? `Résultats pour "${search}"` : "Tous les produits"}
          </h1>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Rechercher des produits..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filtres
                  </h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                  >
                    <FunnelIcon className="h-5 w-5" />
                  </button>
                </div>

                <div
                  className={`space-y-6 ${
                    showFilters ? "block" : "hidden lg:block"
                  }`}
                >
                  {/* Categories */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Catégories
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          checked={!category}
                          onChange={() => handleFilterChange("category", "")}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Toutes
                        </span>
                      </label>
                      {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            checked={category === cat.slug}
                            onChange={() =>
                              handleFilterChange("category", cat.slug)
                            }
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {cat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Prix
                    </h4>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Prix min"
                        value={minPrice}
                        onChange={(e) =>
                          handleFilterChange("minPrice", e.target.value)
                        }
                        className="input input-sm"
                      />
                      <input
                        type="number"
                        placeholder="Prix max"
                        value={maxPrice}
                        onChange={(e) =>
                          handleFilterChange("maxPrice", e.target.value)
                        }
                        className="input input-sm"
                      />
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(search || category || minPrice || maxPrice) && (
                    <button
                      onClick={clearFilters}
                      className="w-full btn-outline btn-sm"
                    >
                      Effacer les filtres
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <p className="text-sm text-gray-700 mb-4 sm:mb-0">
                {pagination.totalProducts || 0} produit
                {pagination.totalProducts !== 1 ? "s" : ""} trouvé
                {pagination.totalProducts !== 1 ? "s" : ""}
              </p>

              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Trier par:</label>
                <select
                  value={`${sort}-${order}`}
                  onChange={(e) => {
                    const [newSort, newOrder] = e.target.value.split("-");
                    handleSortChange(newSort);
                  }}
                  className="input input-sm w-auto"
                >
                  <option value="createdAt-DESC">Plus récents</option>
                  <option value="createdAt-ASC">Plus anciens</option>
                  <option value="name-ASC">Nom A-Z</option>
                  <option value="name-DESC">Nom Z-A</option>
                  <option value="basePrice-ASC">Prix croissant</option>
                  <option value="basePrice-DESC">Prix décroissant</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche.
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
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
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            pageNum === page
                              ? "bg-primary-600 text-white"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Suivant
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
