const express = require("express");
const multer = require("multer");
const { requireAuth } = require("../middleware/auth");
const { generate, history, downloadImage, deleteImage, editImage, analyzeImage, uploadImage } = require("../controllers/imageController");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

function imageRoutes() {
  const router = express.Router();

  router.post("/generate", requireAuth, generate);
  router.get("/history", requireAuth, history);
  router.get("/download", requireAuth, downloadImage);
  router.delete("/:imageId", requireAuth, deleteImage);
  router.post("/edit", requireAuth, editImage);
  router.post("/analyze", requireAuth, analyzeImage);
  router.post("/upload", requireAuth, upload.single('file'), uploadImage);

  return router;
}

module.exports = { imageRoutes };

