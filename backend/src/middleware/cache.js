const cache = require("../utils/cache");
const logger = require("../config/logger");

/**
 * Cache middleware
 * @param {number} duration - Cache duration in seconds (default: 300)
 */
const cacheMiddleware =
  (duration = 300) =>
  (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      if (process.env.NODE_ENV === "development") {
        logger.debug(`Cache hit for ${key}`);
      }
      // Set header to indicate cache hit
      res.setHeader("X-Cache", "HIT");
      return res.send(cachedResponse);
    }

    if (process.env.NODE_ENV === "development") {
      logger.debug(`Cache miss for ${key}`);
    }

    const originalSend = res.send;
    res.send = function (body) {
      if (res.statusCode === 200) {
        cache.set(key, body, duration);
      }
      res.setHeader("X-Cache", "MISS");
      originalSend.call(this, body);
    };
    next();
  };

module.exports = cacheMiddleware;
