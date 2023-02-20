const { expressjwt: jwt } = require("express-jwt");
const { UNAUTHORIZED, NOT_FOUND } = require('../utils/statusCode')
const { loggerUtil } = require('./../utils/logger')
const dotenv = require('dotenv')
const User = require("../models/userModel")

dotenv.config()

const isSignedIn = jwt({
    secret: process.env.SECRET,
    algorithms: ['HS256', 'RS256'],
    userProperty: 'auth'
})

const isValidToken = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res
            .status(UNAUTHORIZED)
            .json({ error: 'Authentication Failed!' })
    }
    next()
}

const isAuthenticated = (
    req,
    res,
    next,
) => {
    const checker = req.profile && req.auth && req.profile.id == req.auth.id
    if (!checker) {
        return res.status(SC.FORBIDDEN).json({
            error: 'ACCESS DENIED!'
        })
    }
    return next()
}

const isAdmin = async (req, res, next) => {
    const authId = req.auth._id

    if (authId) {
        User.findById(authId).exec((err, user) => {
            if (err || !user) {
                return res.status(NOT_FOUND).json({
                    error: 'No user was found in DB!'
                })
            }
            if (user.role === 3) {
                next()
            } else {
                res.status(UNAUTHORIZED).json({
                    error: 'Not an admin!'
                })
            }
        })
    }
}

const isSameUserOrAdmin = async (req, res, next) => {
    console.log(req);
    const authId = req.auth._id
    const userId = req.params.userId
    if (authId) {
        User.findById(authId).exec((err, user) => {
            if (err || !user) {
                return res.status(NOT_FOUND).json({
                    status: NOT_FOUND,
                    error: 'No User Found!'
                })
            }
            if (user.role === 3 || user.userId == userId) {
                next()
            } else {
                res.status(UNAUTHORIZED).json({
                    status: UNAUTHORIZED,
                    error: 'Not an admin or Same as Logged in User'
                })
            }
        })
    }
}


module.exports = { isSignedIn, isValidToken, isAuthenticated, isAdmin, isSameUserOrAdmin }