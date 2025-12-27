import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  X,
  SlidersHorizontal,
  Monitor,
  Search,
  Grid,
  List,
  ChevronDown,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { products, categories } from "../data/products";
import { formatCurrency } from "../utils/currency";
import { Space, Menu } from "antd";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";
  const [priceRange, setPriceRange] = useState(20000000);
  const [sortBy, setSortBy] = useState("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Update local search when URL changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by category
    if (activeCategory !== "all") {
      const lowerCat = activeCategory.toLowerCase();
      result = result.filter(
        (p) =>
          p.category.toLowerCase() === lowerCat ||
          p.subcategory?.toLowerCase() === lowerCat
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    result = result.filter((p) => p.price <= priceRange);

    // Sort products
    switch (sortBy) {
      case "price-low":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        result = [...result].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        break;
      default:
        // featured - keep original order or sort by featured flag
        result = result
          .filter((p) => p.featured)
          .concat(result.filter((p) => !p.featured));
        break;
    }

    return result;
  }, [activeCategory, searchQuery, priceRange, sortBy]);

  const handleCategoryChange = useCallback(
    (catId) => {
      const params = new URLSearchParams(searchParams);
      params.set("category", catId);
      setSearchParams(params);
      setIsMobileFilterOpen(false);
    },
    [searchParams, setSearchParams]
  );

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const params = new URLSearchParams(searchParams);
      if (localSearch) {
        params.set("search", localSearch);
      } else {
        params.delete("search");
      }
      setSearchParams(params);
    },
    [localSearch, searchParams, setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams({});
    setPriceRange(20000000);
    setSortBy("featured");
    setLocalSearch("");
  }, [setSearchParams]);

  const sortOptions = [
    { value: "featured", label: "Featured", icon: TrendingUp },
    { value: "newest", label: "Newest", icon: Clock },
    { value: "price-low", label: "Price: Low to High", icon: DollarSign },
    { value: "price-high", label: "Price: High to Low", icon: DollarSign },
    { value: "rating", label: "Top Rated", icon: Star },
  ];

  const getCategoryIcon = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.icon || "💻";
  };

  // Prepare menu items for Ant Design Menu
  const categoryMenuItems = categories.map((cat) => ({
    key: cat.id,
    icon: <span className="text-xl">{cat.icon}</span>,
    label: (
      <div className="flex justify-between items-center w-full">
        <span>{cat.name}</span>
        <span className="text-xs text-gray-500">
          {
            products.filter(
              (p) =>
                p.category.toLowerCase() === cat.id.toLowerCase() ||
                p.subcategory?.toLowerCase() === cat.id.toLowerCase()
            ).length
          }
        </span>
      </div>
    ),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2306b6d4\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <Space
            orientation="vertical"
            size={40}
            className="w-full max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Our <span className="text-cyan-400">Products</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl">
                Discover premium technology products curated for excellence
              </p>
            </motion.div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search products by name, category, or description..."
                  className="w-full px-6 py-4 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 pr-12"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>
          </Space>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-white/5 rounded-lg">
              <span className="text-sm font-medium text-white">
                {filteredProducts.length} Products
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
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {searchQuery && (
              <div className="px-3 py-1.5 bg-white/5 rounded-lg flex items-center gap-2">
                <span className="text-gray-400 text-sm">
                  Search: "{searchQuery}"
                </span>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("search");
                    setSearchParams(params);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium text-white">
                  {sortOptions.find((opt) => opt.value === sortBy)?.label}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showSortOptions ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showSortOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="py-1">
                      {sortOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSortOptions(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                              sortBy === option.value
                                ? "bg-cyan-500/10 text-cyan-400"
                                : "text-gray-300 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white/5 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium text-white">Filters</span>
            </button>

            {/* Clear Filters */}
            {(activeCategory !== "all" ||
              searchQuery ||
              priceRange < 20000000) && (
              <button
                onClick={clearFilters}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
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
            <div className="sticky top-24">
              <Space orientation="vertical" size={24} className="w-full">
                {/* Categories with Ant Design Menu */}
                <div className="bg-gradient-to-b from-gray-900/50 to-black/50 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-gray-800">
                    Categories
                  </h3>
                  <Menu
                    mode="vertical"
                    selectedKeys={[activeCategory]}
                    onSelect={({ key }) => handleCategoryChange(key)}
                    items={categoryMenuItems}
                    className="bg-transparent border-0 custom-menu"
                  />
                </div>

                {/* Price Range */}
                <div className="bg-gradient-to-b from-gray-900/50 to-black/50 rounded-2xl p-6 border border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">
                      Price Range
                    </h3>
                    <span className="text-cyan-400 font-bold">
                      {formatCurrency(priceRange)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20000000"
                    step="100000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <Space
                    orientation="horizontal"
                    className="w-full justify-between mt-3"
                  >
                    <span className="text-sm text-gray-400">
                      {formatCurrency(0)}
                    </span>
                    <span className="text-sm text-gray-400">
                      {formatCurrency(20000000)}
                    </span>
                  </Space>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-b from-gray-900/50 to-black/50 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Product Stats
                  </h3>
                  <Space orientation="vertical" size={16} className="w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Products</span>
                      <span className="text-white font-bold">
                        {products.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Categories</span>
                      <span className="text-white font-bold">
                        {categories.length - 1}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Average Rating</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {Math.round(
                          (products.reduce((acc, p) => acc + p.rating, 0) /
                            products.length) *
                            10
                        ) / 10}
                      </span>
                    </div>
                  </Space>
                </div>

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
              </Space>
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
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden"
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  className="fixed right-0 top-0 h-full w-full max-w-sm bg-gradient-to-b from-gray-900 to-black z-50 shadow-2xl overflow-y-auto lg:hidden"
                >
                  <Space orientation="vertical" size={24} className="p-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-white">Filters</h2>
                      <button
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="p-2 text-gray-400 hover:text-white"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <h3 className="font-semibold text-white mb-3">Sort By</h3>
                      <Space orientation="vertical" size={8} className="w-full">
                        {sortOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSortBy(option.value);
                                setIsMobileFilterOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                                sortBy === option.value
                                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
                                  : "text-gray-400 border border-gray-800 hover:border-gray-700"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {option.label}
                            </button>
                          );
                        })}
                      </Space>
                    </div>

                    {/* Categories */}
                    <div>
                      <h3 className="font-semibold text-white mb-3">
                        Categories
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                              activeCategory === cat.id
                                ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30"
                                : "bg-white/5 text-gray-400 border-gray-800 hover:border-gray-700"
                            }`}
                          >
                            <span className="text-2xl mb-2">{cat.icon}</span>
                            <span className="text-sm font-medium">
                              {cat.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="font-semibold text-white mb-3">
                        Price: {formatCurrency(priceRange)}
                      </h3>
                      <input
                        type="range"
                        min="0"
                        max="20000000"
                        step="100000"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
                      />
                      <Space
                        orientation="horizontal"
                        className="w-full justify-between mt-2"
                      >
                        <span className="text-sm text-gray-400">
                          {formatCurrency(0)}
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatCurrency(20000000)}
                        </span>
                      </Space>
                    </div>

                    {/* Action Buttons */}
                    <Space
                      orientation="vertical"
                      size={12}
                      className="w-full pt-6 border-t border-gray-800"
                    >
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
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-medium hover:from-cyan-500 hover:to-blue-500 transition-all"
                      >
                        Apply Filters
                      </button>
                    </Space>
                  </Space>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="h-[500px] bg-white/5 rounded-3xl animate-pulse"
                    />
                  ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div
                className={`grid gap-8 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {filteredProducts.map((product, index) => (
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
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-gray-800">
                  <Monitor className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  No products found
                </h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your filters or search for something else
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-500 hover:to-blue-500 transition-all"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}

            {/* Results Info */}
            {!isLoading && filteredProducts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                <p className="text-gray-500">
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add custom styles for Menu */}
      <style>{`
        .custom-menu.ant-menu {
          background: transparent;
          border: none;
        }
        .custom-menu .ant-menu-item {
          margin: 0;
          padding: 12px 16px !important;
          height: auto;
          border-radius: 12px;
          margin-bottom: 4px;
        }
        .custom-menu .ant-menu-item:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .custom-menu .ant-menu-item-selected {
          background: linear-gradient(to right, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2)) !important;
          color: #22d3ee !important;
          border: 1px solid rgba(6, 182, 212, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default Products;
