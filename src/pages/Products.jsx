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
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { formatCurrency } from "../utils/currency";
import { Space, Menu, Spin, Pagination, Card } from "antd";
import SEO from "../components/SEO";

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
  const [showSortOptions, setShowSortOptions] = useState(false);
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
  const { data: categoriesData } = useCategories();

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
        id: c.slug,
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
    [searchParams, setSearchParams]
  );

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    // Triggered by effect via localSearch state
  }, []);

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

  const categoryMenuItems = categories.map((cat) => ({
    key: cat.id,
    icon: <span className="text-xl">{cat.icon}</span>,
    label: (
      <div className="flex justify-between items-center w-full">
        <span>{cat.name}</span>
      </div>
    ),
  }));

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <SEO
        title="Store Explorer"
        description="Browse our curated selection of high-performance laptops, custom-built desktops, and premium computing accessories at Nashiecom Technologies."
        url="/products"
      />
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2306b6d4\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <Space
            orientation="vertical"
            size="large"
            className="w-full max-w-4xl mx-auto text-center"
            style={{ gap: 'var(--space-xl)' }}
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
                    setLocalSearch("");
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
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-gray-400 hover:text-white"
                  }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list"
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
                  className={`w-4 h-4 transition-transform ${showSortOptions ? "rotate-180" : ""
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
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${sortBy === option.value
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
                <Card
                  className="!bg-gradient-to-b !from-gray-900/50 !to-black/50 !rounded-2xl !border-gray-800 !border-0"
                  styles={{ body: { padding: "1.5rem" } }}
                >
                  <h3 className="text-lg font-bold text-white mb-4 pb-3 border-b border-gray-800">
                    Categories
                  </h3>
                  {categories.length > 0 && (
                    <Menu
                      mode="vertical"
                      selectedKeys={[activeCategory]}
                      onSelect={({ key }) => handleCategoryChange(key)}
                      items={categoryMenuItems}
                      className="bg-transparent border-0 custom-menu"
                    />
                  )}
                </Card>

                {/* Price Range */}
                <Card
                  className="!bg-gradient-to-b !from-gray-900/50 !to-black/50 !rounded-2xl !border-gray-800 !border-0"
                  styles={{ body: { padding: "1.5rem" } }}
                >
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
                </Card>

                {/* Stats */}
                <Card
                  className="!bg-gradient-to-b !from-gray-900/50 !to-black/50 !rounded-2xl !border-gray-800 !border-0"
                  styles={{ body: { padding: "1.5rem" } }}
                >
                  <h3 className="text-lg font-bold text-white mb-4">
                    Product Stats
                  </h3>
                  <Space orientation="vertical" size={16} className="w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Products</span>
                      <span className="text-white font-bold">
                        {totalProducts}
                      </span>
                    </div>
                  </Space>
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
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${sortBy === option.value
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
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${activeCategory === cat.id
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
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <Card className="!bg-white/5 !rounded-2xl !border-0 h-[500px] animate-pulse" />
                    </motion.div>
                  ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div
                  className={`grid gap-8 ${viewMode === "grid"
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
                <div className="flex justify-center mt-12">
                  <Pagination
                    current={page}
                    pageSize={12}
                    total={totalProducts}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    theme="dark" // AntD doesn't support theme prop directly on Pagination like this, but we'll style it or rely on ConfigProvider
                    className="ant-pagination-white"
                  />
                </div>
                <style>{`
                   .ant-pagination-white .ant-pagination-item a {
                     color: #fff;
                   }
                   .ant-pagination-white .ant-pagination-item-active {
                     background: #06b6d4;
                     border-color: #06b6d4;
                   }
                   .ant-pagination-white .ant-pagination-prev .ant-pagination-item-link,
                   .ant-pagination-white .ant-pagination-next .ant-pagination-item-link {
                     color: #fff;
                     background: rgba(255,255,255,0.1);
                     border: none;
                   }
                  `}</style>
              </>
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
            {!isLoading && products.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                <p className="text-gray-500">
                  Showing {products.length} of {totalProducts} products
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
