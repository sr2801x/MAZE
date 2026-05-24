const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { generate, history, downloadImage } = require("../controllers/imageController");

function imageRoutes() {
  const router = express.Router();

  router.post("/generate", requireAuth, generate);
  router.get("/history", requireAuth, history);
  router.get("/download", requireAuth, downloadImage);

  return router;
}

module.exports = { imageRoutes };

