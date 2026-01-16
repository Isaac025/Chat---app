const jwt = require("jsonwebtoken");
const USER = require("../models/user");

//middleware to protect routes
const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await USER.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized access" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = protectRoute;
