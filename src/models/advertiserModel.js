const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const advertiserSchema = new mongoose.Schema(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    busiessName: {
      type: String,
      required: [true, "Business name is required"],
    },
    contactName: { type: String, required: [true, "Contact name is required"] },
    phone: { type: String, required: [true, "Phone number is required"] },
    email: { type: String, required: [true, "Email is required"] },
  },
  { timestamps: true }
);

const Advertisers = mongoose.model("Advertisers", advertiserSchema);

module.exports = Advertisers;
