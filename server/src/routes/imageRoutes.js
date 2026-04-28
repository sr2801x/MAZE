const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { generate, history } = require("../controllers/imageController");

function imageRoutes() {
  const router = express.Router();

  router.post("/generate", requireAuth, generate);
  router.get("/history", requireAuth, history);

  return router;
}

module.exports = { imageRoutes };

