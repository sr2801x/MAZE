const rateLimit = require("express-rate-limit");

function createRateLimiter() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
  const max = Number(process.env.RATE_LIMIT_MAX || 10000); // Increased to 10000 for development

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, message: "Too many requests. Please try again soon." },
  });
}

module.exports = { createRateLimiter };

