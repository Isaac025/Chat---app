const mongoose = require("mongoose");

// dunc to connect to the mongodb database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "chat-app" });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Stop app if DB fails
  }
};

module.exports = connectDB;
