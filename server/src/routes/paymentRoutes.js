const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { createCheckout, pricing, devProcessPendingTransactions } = require("../controllers/paymentController");

function paymentRoutes() {
  const router = express.Router();

  router.get("/pricing", pricing);
  router.post("/checkout", requireAuth, createCheckout);
  
  // DEV ONLY: Process pending transactions manually
  if (process.env.NODE_ENV !== "production") {
    router.post("/dev/process-pending", devProcessPendingTransactions);
  }

  return router;
}

module.exports = { paymentRoutes };

