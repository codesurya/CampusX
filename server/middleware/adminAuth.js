/**
 * Admin Authorization Middleware
 * Verifies JWT token AND checks directly against MongoDB to ensure
 * the requesting user has an authentic, verified "admin" role.
 * Rejects all unauthorized student requests with 403 Forbidden.
 */
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function adminAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Authentication required. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    // Direct database validation to prevent forged tokens or stale permissions
    const user = await User.findById(decoded.id).select("role name email");
    if (!user) {
      return res.status(401).json({ message: "User account no longer exists." });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access forbidden. Administrator privileges are required to access this endpoint.",
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

