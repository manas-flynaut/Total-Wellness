const { loggerUtil } = require("../utils/logger")
const { isSignedIn, isValidToken } = require("../middleware/index")
const auth = require("./auth")
const users = require("./users")


const routes = (app) => {
    // Test Route for API
    app.get("/api/v1/welcome", (req, res) => {
        loggerUtil("Welcome API called.")
        res.send("Welcome to API for Carboard Connection.\n Servers are Up and Running")
    })

    app.use("/api/v1", auth)
    app.use("/api/v1", isSignedIn, isValidToken, users)

    return app
}


module.exports = routes