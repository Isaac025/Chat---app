const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/auth");
const {
  getMessages,
  getUsersForSidebar,
  markMessageAsSeen,
  sendMessage,
} = require("../controllers/messageControllers");

router.get("/user", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.put("/mark/:id", protectRoute, markMessageAsSeen);
router.post("/send/:id", protectRoute, sendMessage);

module.exports = router;
