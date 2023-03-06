const express = require("express");
const {
  getNotifications,
  addNotifications,
} = require("../controllers/notifications");
const { isSameUserOrAdmin } = require("../middleware");

const notificationsRoute = express.Router();

notificationsRoute.get(
  "/notification/:userId",
  isSameUserOrAdmin,
  getNotifications
);

notificationsRoute.post(
  "/notification/:userId",
  isSameUserOrAdmin,
  addNotifications
);

module.exports = notificationsRoute;
