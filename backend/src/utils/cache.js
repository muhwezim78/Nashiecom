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

module.exports = cache;
