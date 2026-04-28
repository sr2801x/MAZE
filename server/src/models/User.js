const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserHistoryItemSchema = new mongoose.Schema(
  {
    imageId: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
    prompt: { type: String, required: true },
    imageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String }, // email/password (optional for OTP-only)
    googleId: { type: String },
    avatarUrl: { type: String },

    credits: { type: Number, default: 5 },
    plan: { type: String, default: "free" },

    history: { type: [UserHistoryItemSchema], default: [] },

    otpHash: { type: String },
    otpExpiresAt: { type: Date },
    otpIssuedAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.methods.verifyPassword = async function verifyPassword(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.methods.setPassword = async function setPassword(password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
};

const User = mongoose.model("User", UserSchema);

module.exports = { User };

