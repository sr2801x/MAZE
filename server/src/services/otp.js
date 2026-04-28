const crypto = require("crypto");
const bcrypt = require("bcryptjs");

function generateOtp() {
  // 6-digit numeric OTP
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

async function hashOtp(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

async function verifyOtp(otp, hash) {
  if (!hash) return false;
  return bcrypt.compare(otp, hash);
}

module.exports = { generateOtp, hashOtp, verifyOtp };

