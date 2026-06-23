import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  X,
  Monitor,
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { formatCurrency } from "../utils/currency";
import SEO from "../components/SEO";

import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Spinner } from "../components/ui/Spinner";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get filter values from URL
  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const priceMax = parseInt(searchParams.get("priceMax") || "20000000");

  const [priceRange, setPriceRange] = useState(priceMax);
  const [sortBy, setSortBy] = useState("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search update
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        const params = new URLSearchParams(searchParams);
        if (localSearch) {
          params.set("search", localSearch);
        } else {
          params.delete("search");
        }
        params.set("page", "1"); // Reset to page 1 on search
        setSearchParams(params);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearch, searchQuery, searchParams, setSearchParams]);

  // Debounced price range state for query
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500);
    return () => clearTimeout(handler);
  }, [priceRange]);

  // Prepare Query Params
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit: 12,
      minPrice: 0,
      maxPrice: debouncedPriceRange,
    };

    if (activeCategory !== "all") {
      params.category = activeCategory;
    }

    if (searchQuery) {
      params.search = searchQuery;
    }

    switch (sortBy) {
      case "price-low":
        params.sortBy = "price";
        params.sortOrder = "asc";
        break;
      case "price-high":
        params.sortBy = "price";
        params.sortOrder = "desc";
        break;
      case "rating":
        params.sortBy = "rating";
        params.sortOrder = "desc";
        break;
      case "newest":
        params.sortBy = "createdAt";
        params.sortOrder = "desc";
        break;
      default:
        params.sortBy = sortBy;
        break;
    }
    return params;
  }, [page, debouncedPriceRange, activeCategory, searchQuery, sortBy]);

  // Data Fetching Hooks
  const { data: productsData, isLoading: isProductsLoading } =
    useProducts(queryParams);
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useCategories();

  const products = productsData?.data?.products || [];
  const totalProducts = productsData?.data?.pagination?.total || 0;
  const isLoading = isProductsLoading;

  // Process Categories
  const categories = useMemo(() => {
    if (!categoriesData?.data?.categories) return [];
    return [
      { id: "all", name: "All Categories", icon: "🔍", slug: "all" },
      ...categoriesData.data.categories.map((c) => ({
        ...c,
        id: c.id, // Use UUID for robustness
        icon: c.icon || "💻",
      })),
    ];
  }, [categoriesData]);

  const handleCategoryChange = useCallback(
    (catId) => {
      const params = new URLSearchParams(searchParams);
      params.set("category", catId);
      params.set("page", "1"); // Reset page
      setSearchParams(params);
      setIsMobileFilterOpen(false);
    },
    [searchParams, setSearchParams],
  );

  const handleSearch = useCallback((e) => {
    e.preventDefault();
  }, []);

  const clearFilters = useCallback(() => {
    setSearchParams({});
    setPriceRange(20000000);
    setSortBy("featured");
    setLocalSearch("");
  }, [setSearchParams]);

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
  ];

  const getCategoryIcon = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.icon || "💻";
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  const totalPages = Math.max(1, Math.ceil(totalProducts / 12));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-500">
      <SEO
        title="Store Explorer"
        description="Browse our curated selection of high-performance laptops, custom-built desktops, and premium computing accessories at Nashiecom Technologies."
        url="/products"
      />
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2306b6d4\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="w-full max-w-4xl mx-auto text-center flex flex-col gap-[var(--space-xl)]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)]">
                Our <span className="text-cyan-400">Products</span>
              </h1>
              <p className="text-[var(--text-muted)] text-lg md:text-xl">
                Discover premium technology products curated for excellence
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Sticky Search Bar Header */}
      <div className="sticky top-20 z-40 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] shadow-lg transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative max-w-2xl mx-auto">
              <Input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search products by name, category, or description..."
                className="w-full px-6 py-4 bg-[var(--bg-glass)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder-gray-500 h-14 text-base"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-10 pb-20">
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 bg-[var(--bg-glass)] rounded-lg">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {totalProducts} Products
              </span>
            </div>
            {activeCategory !== "all" && (
              <div className="px-3 py-1.5 bg-cyan-500/10 rounded-lg flex items-center gap-2">
                <span className="text-cyan-400 text-sm">
                  {getCategoryIcon(activeCategory)}{" "}
                  {categories.find((c) => c.id === activeCategory)?.name}
                </span>
                <button
                  onClick={() => handleCategoryChange("all")}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {searchQuery && (
              <div className="px-3 py-1.5 bg-[var(--bg-glass)] rounded-lg flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  Search: "{searchQuery}"
                </span>
                <button
                  onClick={() => {
                    setLocalSearch("");
                  }}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-1 bg-[var(--bg-glass)] rounded-lg p-1 border border-[var(--border-subtle)]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-48 h-[42px] bg-[var(--bg-glass)] text-[var(--text-primary)] border-[var(--border-subtle)]"
              options={sortOptions}
            />

            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-glass)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-main)] transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Filters
              </span>
            </button>

            {/* Clear Filters */}
            {(activeCategory !== "all" ||
              searchQuery ||
              priceRange < 20000000) && (
              <button
                onClick={clearFilters}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-[176px] flex flex-col gap-6">
              {/* Categories */}
              <Card className="bg-[var(--bg-secondary)] rounded-2xl border-[var(--border-subtle)] p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 pb-3 border-b border-[var(--border-subtle)]">
                  Categories
                </h3>
                {isCategoriesLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="md" />
                  </div>
                ) : isCategoriesError ? (
                  <p className="text-red-400 text-sm">
                    Failed to load categories
                  </p>
                ) : categories.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                          activeCategory === cat.id
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)] border border-transparent"
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-muted)] text-sm">
                    No categories available
                  </p>
                )}
              </Card>

              {/* Price Range */}
              <Card className="bg-[var(--bg-secondary)] rounded-2xl border-[var(--border-subtle)] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Price Range
                  </h3>
                  <span className="text-cyan-400 font-bold">
                    {formatCurrency(priceRange)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20000000}
                  step={100000}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between mt-3 text-sm text-gray-400">
                  <span>{formatCurrency(0)}</span>
                  <span>{formatCurrency(20000000)}</span>
                </div>
              </Card>

              {/* Stats */}
              <Card className="bg-[var(--bg-secondary)] rounded-2xl border-[var(--border-subtle)] p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                  Product Stats
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Products</span>
                    <span className="text-[var(--text-primary)] font-bold">
                      {totalProducts}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Clear Filters Button */}
              {(activeCategory !== "all" ||
                searchQuery ||
                priceRange < 20000000) && (
                <button
                  onClick={clearFilters}
                  className="w-full py-3 px-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Mobile Filter Sheet */}
          <AnimatePresence>
            {isMobileFilterOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="fixed inset-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-sm lg:hidden"
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  className="fixed right-0 top-0 h-full w-full max-w-sm bg-[var(--bg-secondary)] z-50 shadow-2xl overflow-y-auto lg:hidden"
                >
                  <div className="flex flex-col gap-6 p-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">
                        Filters
                      </h2>
                      <button
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] mb-3">
                        Sort By
                      </h3>
                      <div className="flex flex-col gap-2">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setIsMobileFilterOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border ${
                              sortBy === option.value
                                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/20"
                                : "text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-[var(--border-main)]"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] mb-3">
                        Categories
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center h-full ${
                              activeCategory === cat.id
                                ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30"
                                : "bg-[var(--bg-glass)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-[var(--border-main)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            <span className="text-2xl mb-2">{cat.icon}</span>
                            <span className="text-sm font-medium leading-tight">
                              {cat.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] mb-3">
                        Price: {formatCurrency(priceRange)}
                      </h3>
                      <input
                        type="range"
                        min={0}
                        max={10000000}
                        step={10000}
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                      <div className="flex justify-between mt-2 text-sm text-gray-400">
                        <span>{formatCurrency(0)}</span>
                        <span>{formatCurrency(20000000)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 w-full pt-6 border-t border-[var(--border-subtle)]">
                      {(activeCategory !== "all" ||
                        searchQuery ||
                        priceRange < 20000000) && (
                        <button
                          onClick={clearFilters}
                          className="w-full py-3 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors"
                        >
                          Clear All Filters
                        </button>
                      )}
                      <button
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-[var(--bg-primary)] rounded-xl font-medium hover:from-cyan-500 hover:to-blue-500 transition-all"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <Card
                        className="bg-[var(--bg-glass)] rounded-2xl border-0 h-[500px] animate-pulse"
                      />
                    </motion.div>
                  ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div
                  className={`grid gap-4 ${
                    viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
                {/* Pagination */}
                <div className="flex items-center gap-4 mt-12 justify-center">
                  <button 
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="p-3 rounded-lg bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-[var(--text-primary)] font-medium px-4">
                    Page {page} of {totalPages}
                  </span>
                  <button 
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="p-3 rounded-lg bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                <Card
                  className="bg-[var(--bg-glass)] rounded-3xl border-[var(--border-subtle)] backdrop-blur-xl text-center p-12"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center border border-[var(--border-subtle)]">
                    <Monitor className="w-12 h-12 text-[var(--text-muted)]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                    No products found
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
                    We couldn't find any products matching your current
                    criteria. Try adjusting your filters or search terms.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-[var(--bg-primary)] rounded-xl font-bold uppercase tracking-wider hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/25"
                  >
                    Clear All Filters
                  </button>
                </Card>
              </motion.div>
            )}

            {/* Results Info */}
            {!isLoading && products.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center">
                <p className="text-[var(--text-muted)]">
                  Showing {products.length} of {totalProducts} products
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
