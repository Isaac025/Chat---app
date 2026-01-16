const express = require("express");
const router = express.Router();
const {
  signUp,
  login,
  checkAuth,
  updateProfile,
} = require("../controllers/userController");
const protectRoute = require("../middleware/auth");

router.post("/signup", signUp);
router.post("/login", login);
router.get("/check", protectRoute, checkAuth);
router.patch("/update-profile", protectRoute, updateProfile);

module.exports = router;
