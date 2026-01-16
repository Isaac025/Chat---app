const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    text: { type: String },
    image: { type: String },
    seen: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const MESSAGE = mongoose.model("message", messageSchema);
module.exports = MESSAGE;
