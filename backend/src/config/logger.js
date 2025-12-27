// Logger Configuration using Winston
const winston = require("winston");
const path = require("path");

const logDir = path.join(__dirname, "../../logs");

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
  ],
});

// Add file transports in production
if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    })
  );
  logger.add(
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    })
  );
}

module.exports = logger;
