const Cards = require("../models/cardsModel");
const User = require("../models/userModel");
const { loggerUtil } = require("../utils/logger");
const { OK, BAD_REQUEST, NOT_FOUND } = require("../utils/statusCode");

const addCards = async (req, res) => {
  try {
    const { name, email, phone, timeFrame, summery, images } = req.body;
    const { userId } = req.params;

    User.findOne({ userId: userId }).then((user) => {
      const createCard = new Cards({
        user: User._id,
        name: name,
        email: email,
        phone: phone,
        images: images,
        timeFrame: timeFrame,
        summery: summery,
      });

      createCard.save().then(async (card) => {
        res.status(OK).json({
          status: OK,
          message: "card added successfuly",
          data: card,
        });
      });
    });
  } catch (err) {
    loggerUtil(err, "ERROR");
  } finally {
    loggerUtil("Add card API Called.");
  }
};

const getCards = async (req, res) => {
  try {
    const { userId } = req.params;

    Cards.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .then((cards) => {
        if (!cards) {
          return res.status(NOT_FOUND).json({
            error: "No cards were found in DB!",
          });
        }
        res.status(OK).json({
          status: OK,
          message: "cards Fetched Successfully!",
          data: cards,
        });
      });
  } catch (error) {
    loggerUtil(error, "ERROR");
  } finally {
    loggerUtil("Get cards API Called");
  }
};

module.exports = { addCards, getCards };
