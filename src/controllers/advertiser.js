const Advertisers = require("../models/advertiserModel");
const User = require("../models/userModel");
const { loggerUtil } = require("../utils/logger");
const { OK, BAD_REQUEST, NOT_FOUND } = require("../utils/statusCode");

const addAdvertisers = async (req, res) => {
  try {
    const { businessName, contactName, phone, email } = req.body;
    const { userId } = req.params;
    Advertisers;
    User.findOne({ userId: userId }).then((user) => {
      const createAdvertiser = new Advertisers({
        user: user._id,
        businessName: businessName,
        contactName: contactName,
        phone: phone,
        email: email,
      });

      createAdvertiser.save().then(async (advertiser) => {
        res.status(OK).json({
          status: OK,
          message: "advertiser added successfuly",
          data: advertiser,
        });
      });
    });
  } catch (err) {
    loggerUtil(err, "ERROR");
  } finally {
    loggerUtil("Add advertiser API Called.");
  }
};

const getAdvertisers = async (req, res) => {
  try {
    const { userId } = req.params;

    Advertisers.find()
      .sort({ createdAt: -1 })
      .then((advertisers) => {
        if (!advertisers) {
          return res.status(NOT_FOUND).json({
            error: "No advertisers were found in DB!",
          });
        }
        res.status(OK).json({
          status: OK,
          message: "advertisers Fetched Successfully!",
          data: advertisers,
        });
      });
  } catch (error) {
    loggerUtil(error, "ERROR");
  } finally {
    loggerUtil("Get advertisers API Called");
  }
};

module.exports = { addAdvertisers, getAdvertisers };
