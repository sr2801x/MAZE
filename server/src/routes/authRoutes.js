const express = require("express");
const { requestOtp, verifyOtpAndLogin, logout, me, googleSuccess } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

function authRoutes({ passport }) {
  const router = express.Router();

  router.post("/otp/request", requestOtp);
  router.post("/otp/verify", verifyOtpAndLogin);

  router.get("/me", requireAuth, me);
  router.post("/logout", logout);

  router.get(
    "/google",
    (req, res, next) => {
      if (!passport?._strategies?.google) return res.status(501).json({ ok: false, message: "Google OAuth not configured" });
      return next();
    },
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/api/auth/google/failure" }),
    googleSuccess
  );

  router.get("/google/failure", (_req, res) => res.status(401).json({ ok: false, message: "Google login failed" }));

  return router;
}

module.exports = { authRoutes };

