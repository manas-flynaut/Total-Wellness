const Notifications = require("../models/notificationModel");
const User = require("../models/userModel");
const { loggerUtil } = require("../utils/logger");
const { OK, BAD_REQUEST, NOT_FOUND } = require("../utils/statusCode");

const addNotifications = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { userId } = req.params;

    User.findOne({ userId: userId }).then((user) => {
      const createNotification = new Notifications({
        user: user._id,
        notificationId: Math.floor(100000 + Math.random() * 999999),
        title: title,
        content: description,
      });

      createNotification.save().then(async (notification) => {
        res.status(OK).json({
          status: OK,
          message: "notification added successfuly",
          data: notification,
        });
      });
    });
  } catch (err) {
    loggerUtil(err, "ERROR");
  } finally {
    loggerUtil("Add notification API Called.");
  }
};

const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    Notifications.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .then((notifications) => {
        if (!notifications) {
          return res.status(NOT_FOUND).json({
            error: "No notifications were found in DB!",
          });
        }
        res.status(OK).json({
          status: OK,
          message: "notifications Fetched Successfully!",
          data: notifications,
        });
      });
  } catch (error) {
    loggerUtil(error, "ERROR");
  } finally {
    loggerUtil("Get notifications API Called");
  }
};

module.exports = { addNotifications, getNotifications };
