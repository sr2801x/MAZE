const { AppError } = require("../utils/appError");
const { logger } = require("../utils/logger");

function notFoundHandler(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isAppError = err && (err.name === "AppError" || err instanceof AppError);
  const message = isAppError ? err.message : statusCode >= 500 ? "Internal server error" : err.message;

  logger.error("Request error", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    error: err.message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    ok: false,
    message,
  });
}

module.exports = { notFoundHandler, errorHandler };

