const { z } = require("zod");
const { User } = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");
const { AppError } = require("../utils/appError");
const { generateOtp, hashOtp, verifyOtp } = require("../services/otp");
const { sendOtpEmail } = require("../services/mailer");
const { signJwt, getJwtCookieOptions } = require("../config/jwt");

const requestOtpSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(8),
});

function sanitizeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    credits: user.credits,
    plan: user.plan,
    avatarUrl: user.avatarUrl,
  };
}

const requestOtp = asyncHandler(async (req, res) => {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid email", 400);

  const { email } = parsed.data;
  const otp = generateOtp();
  const otpHash = await hashOtp(otp);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

  try {
    const user =
      (await User.findOne({ email })) ||
      (await User.create({ email, name: email.split("@")[0], credits: 5, plan: "free" }));

    user.otpHash = otpHash;
    user.otpIssuedAt = now;
    user.otpExpiresAt = expiresAt;
    await user.save();
  } catch (error) {
    console.error("Error saving user:", error);
    throw new AppError("Failed to process OTP request", 500);
  }

  // Log OTP to console for development
  console.log(`📧 OTP for ${email}: ${otp} (expires in 10 minutes)`);

  res.json({ ok: true, message: "OTP sent" });
});

const verifyOtpAndLogin = asyncHandler(async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid input", 400);

  const { email, otp } = parsed.data;
  const user = await User.findOne({ email });
  if (!user || !user.otpHash || !user.otpExpiresAt) throw new AppError("Invalid OTP", 400);
  if (user.otpExpiresAt.getTime() < Date.now()) throw new AppError("OTP expired", 400);

  const ok = await verifyOtp(otp, user.otpHash);
  if (!ok) throw new AppError("Invalid OTP", 400);

  user.otpHash = undefined;
  user.otpIssuedAt = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const token = signJwt({ sub: String(user._id) });
  res.cookie("maze_token", token, getJwtCookieOptions());
  res.json({ ok: true, token, user: sanitizeUser(user) });
});

const logout = asyncHandler(async (_req, res) => {
  res.clearCookie("maze_token", { path: "/" });
  res.json({ ok: true });
});

const me = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  // Fetch fresh user data from database to ensure credits are up-to-date
  const freshUser = await User.findById(req.user._id).lean();
  if (!freshUser) throw new AppError("User not found", 404);
  // Prevent caching to ensure fresh data is always returned
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.json({ ok: true, user: sanitizeUser(freshUser) });
});

const googleSuccess = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new AppError("Unauthorized", 401);

  const token = signJwt({ sub: String(user._id) });
  res.cookie("maze_token", token, getJwtCookieOptions());

  const redirectBase = process.env.CLIENT_OAUTH_REDIRECT || process.env.CLIENT_URL?.split(",")?.[0];
  if (redirectBase) {
    const url = new URL(redirectBase);
    url.searchParams.set("token", token);
    return res.redirect(url.toString());
  }

  return res.json({ ok: true, token, user: sanitizeUser(user) });
});

module.exports = { requestOtp, verifyOtpAndLogin, logout, me, googleSuccess };

