const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cardSchema = new mongoose.Schema(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: [true, "name is required"] },
    email: {
      type: String,
      required: [true, "email is required"],
    },
    phone: { type: String, required: [true, "Phone number is reuired"] },
    timeFrame: {
      type: Number,
      enums: [0, 1, 2, 3],
      default: 0,
    },
    images: {
      type: Array[String],
    },
    summery: {
      type: String,
      required: [true, "Summery is required"],
    },
    status: {
      type: Number,
      enums: [0, 1],
      default: 0,
    },
  },
  { timestamps: true }
);

const Cards = mongoose.model("Cards", cardSchema);

module.exports = Cards;
