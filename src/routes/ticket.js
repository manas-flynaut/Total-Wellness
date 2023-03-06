const express = require("express");
const { getTickets, addTickets } = require("../controllers/tickets");
const { isSameUserOrAdmin } = require("../middleware");

const ticketsRoute = express.Router();

ticketsRoute.get("/ticket/:userId", isSameUserOrAdmin, getTickets);

ticketsRoute.post("/ticket/:userId", isSameUserOrAdmin, addTickets);

module.exports = ticketsRoute;
