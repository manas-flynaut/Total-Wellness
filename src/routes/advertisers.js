const express = require("express");
const { getAdvertisers, addAdvertisers } = require("../controllers/advertiser");
const { isSameUserOrAdmin } = require("../middleware");

const advertisersRoute = express.Router();

advertisersRoute.get("/advertiser/", isSameUserOrAdmin, getAdvertisers);

advertisersRoute.post("/advertiser/:userId", isSameUserOrAdmin, addAdvertisers);

module.exports = advertisersRoute;
