const rateLimit = require("express-rate-limit");

function createRateLimiter() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
  const max = Number(process.env.RATE_LIMIT_MAX || 120);

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, message: "Too many requests. Please try again soon." },
  });
}

module.exports = { createRateLimiter };

