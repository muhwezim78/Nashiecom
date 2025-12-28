const NodeCache = require("node-cache");
const logger = require("../config/logger");

// StdTTL: 10 minutes (600 seconds), Checkperiod: 120 seconds
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

cache.on("set", (key, value) => {
  if (process.env.NODE_ENV === "development") {
    logger.debug(`Cache set for key: ${key}`);
  }
});

cache.on("del", (key, value) => {
  if (process.env.NODE_ENV === "development") {
    logger.debug(`Cache deleted for key: ${key}`);
  }
});

cache.on("expired", (key, value) => {
  if (process.env.NODE_ENV === "development") {
    logger.debug(`Cache expired for key: ${key}`);
  }
});

// Helper function to invalidate product-related cache
const invalidateProductCache = () => {
  const keys = cache.keys();
  const productKeys = keys.filter(
    (key) =>
      key.includes("/api/products") ||
      key.includes("/api/search") ||
      key.includes("/api/categories")
  );
  if (productKeys.length > 0) {
    cache.del(productKeys);
    logger.info(`Invalidated ${productKeys.length} product cache keys`);
  }
};

// Helper function to invalidate category-related cache
const invalidateCategoryCache = () => {
  const keys = cache.keys();
  const categoryKeys = keys.filter((key) => key.includes("/api/categories"));
  if (categoryKeys.length > 0) {
    cache.del(categoryKeys);
    logger.info(`Invalidated ${categoryKeys.length} category cache keys`);
  }
};

module.exports = cache;
module.exports.invalidateProductCache = invalidateProductCache;
module.exports.invalidateCategoryCache = invalidateCategoryCache;
