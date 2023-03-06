const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new mongoose.Schema(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: [true, "notification title is required"] },
    content: {
      type: String,
      required: [true, "notification content is required"],
    },
    status: { type: Number, enum: [0, 1], default: 0 },
  },
  { timestamps: true }
);

const Notifications = mongoose.model("Notifications", notificationSchema);

module.exports = Notifications;
