const { AppError } = require("../utils/appError");
const { verifyJwt } = require("../config/jwt");
const { User } = require("../models/User");

async function requireAuth(req, _res, next) {
  try {
    const bearer = req.headers.authorization || "";
    const tokenFromHeader = bearer.startsWith("Bearer ") ? bearer.slice(7) : null;
    const token = tokenFromHeader || req.cookies?.maze_token;

    if (!token) return next(new AppError("Unauthorized", 401));

    const decoded = verifyJwt(token);
    const user = await User.findById(decoded.sub).lean();
    if (!user) return next(new AppError("Unauthorized", 401));

    req.user = user;
    return next();
  } catch (_e) {
    return next(new AppError("Unauthorized", 401));
  }
}

module.exports = { requireAuth };

