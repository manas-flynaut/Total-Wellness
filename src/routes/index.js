const { loggerUtil } = require("../utils/logger");
const { isSignedIn, isValidToken } = require("../middleware/index");
const auth = require("./auth");
const users = require("./users");
const ticketsRoute = require("./ticket");
const advertisersRoute = require("./advertisers");
const notificationsRoute = require("./notification");

const routes = (app) => {
  // Test Route for API
  app.get("/api/v1/welcome", (req, res) => {
    loggerUtil("Welcome API called.");
    res.send(
      "Welcome to API for Carboard Connection.\n Servers are Up and Running"
    );
  });

  app.use("/api/v1", auth);
  app.use("/api/v1", isSignedIn, isValidToken, users);
  app.use("/api/v1", isSignedIn, isValidToken, ticketsRoute);
  app.use("/api/v1", isSignedIn, isValidToken, advertisersRoute);
  app.use("/api/v1", isSignedIn, isValidToken, notificationsRoute);

  return app;
};

module.exports = routes;
