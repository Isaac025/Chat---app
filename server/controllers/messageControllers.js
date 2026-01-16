const MESSAGE = require("../models/message");
const USER = require("../models/user");
const cloudinary = require("../lib/cloudinary");
const { io, userSocketMap } = require("../server");

// Get all users except the logged in user
const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await USER.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    // Count number of messages not seen
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await MESSAGE.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.status(200).json({ success: true, filteredUsers, unseenMessages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all messages for selected user
const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await MESSAGE.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });
    await MESSAGE.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// api to mark message as seen using message id
const markMessageAsSeen = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    await MESSAGE.findByIdAndUpdate(messageId, { seen: true });
    res.status(200).json({ success: true, message: "Message marked as seen" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// send message to selected user
const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    const newMessage = new MESSAGE.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    // Emit the new Message to the receiver's socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res
      .status(201)
      .json({ success: true, message: "Message sent", newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsersForSidebar,
  getMessages,
  markMessageAsSeen,
  sendMessage,
};
