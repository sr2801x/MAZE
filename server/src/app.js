const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const passport = require("passport");

const { createRateLimiter } = require("./middleware/rateLimit");
const { notFoundHandler, errorHandler } = require("./middleware/error");
const { initPassport } = require("./config/passport");
const { authRoutes } = require("./routes/authRoutes");
const { imageRoutes } = require("./routes/imageRoutes");
const { paymentRoutes } = require("./routes/paymentRoutes");
const { userRoutes } = require("./routes/userRoutes");
const { stripeWebhookHandler } = require("./controllers/paymentController");

async function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin:
        (process.env.CLIENT_URL || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .concat(process.env.NODE_ENV !== "production" ? ["http://localhost:5173"] : []),
      credentials: true,
    })
  );

  // Stripe webhook must receive the raw body (must be mounted before express.json).
  app.post("/api/payments/webhook/stripe", express.raw({ type: "application/json" }), stripeWebhookHandler());

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan("dev"));

  app.use(createRateLimiter());

  initPassport(passport);
  app.use(passport.initialize());

  app.get("/api/health", (_req, res) => res.json({ ok: true, name: "MAZE" }));

  app.use("/api/auth", authRoutes({ passport }));
  app.use("/api/image", imageRoutes());
  app.use("/api/payments", paymentRoutes());
  app.use("/api/user", userRoutes());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

