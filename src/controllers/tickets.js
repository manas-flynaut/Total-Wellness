const Tickets = require("../models/ticketModel");
const User = require("../models/userModel");
const { loggerUtil } = require("../utils/logger");
const { OK, BAD_REQUEST, NOT_FOUND } = require("../utils/statusCode");

const addTickets = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { userId } = req.params;

    User.findOne({ userId: userId }).then((user) => {
      const createTicket = new Tickets({
        user: User._id,
        ticketId: Math.floor(100000 + Math.random() * 999999),
        title: title,
        content: description,
      });

      createTicket.save().then(async (Ticket) => {
        res.status(OK).json({
          status: OK,
          message: "Ticket added successfuly",
          data: Ticket,
        });
      });
    });
  } catch (err) {
    loggerUtil(err, "ERROR");
  } finally {
    loggerUtil("Add Ticket API Called.");
  }
};

const getTickets = async (req, res) => {
  try {
    const { userId } = req.params;

    Tickets.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .then((Tickets) => {
        if (!Tickets) {
          return res.status(NOT_FOUND).json({
            error: "No Tickets were found in DB!",
          });
        }
        res.status(OK).json({
          status: OK,
          message: "Tickets Fetched Successfully!",
          data: Tickets,
        });
      });
  } catch (error) {
    loggerUtil(error, "ERROR");
  } finally {
    loggerUtil("Get Tickets API Called");
  }
};

module.exports = { addTickets, getTickets };
