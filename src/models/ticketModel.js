const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketSchema = new mongoose.Schema(
  {
    User: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketId: { type: String, required: [true, "TicketID is required"] },
    title: { type: String, required: [true, "Ticket title is required"] },
    content: { type: String, required: [true, "Ticket content is required"] },
    status: { type: Number, enum: [0, 1, 2], default: 0 },
  },
  { timestamps: true }
);

const Tickets = mongoose.model("Tickets", ticketSchema);

module.exports = Tickets;
