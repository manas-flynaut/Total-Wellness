const User = require("../models/userModel")
const { loggerUtil } = require("../utils/logger")
const { OK, NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR } = require("../utils/statusCode")

const getUserById = async (req, res) => {
    try {
        const id = req.params
        User
            .findOne(
                id,
                { salt: 0, encrypted_password: 0, __v: 0, profilePhoto: 0 }
            )
            .exec((err, user) => {
                if (err || !user) {
                    return res.status(NOT_FOUND).json({
                        error: 'No user was found in DB!'
                    })
                }
                res.status(OK).json({
                    message: 'User Fetched Successfully!',
                    data: user
                })
            })
    } catch (err) {
        loggerUtil(err, 'ERROR')
    } finally {
        loggerUtil('Get User By Id Function is Executed!')
    }
}

const getAllUsers = async (req, res) => {
    try {
        const limit = req.query.limit || 10
        const skip = req.query.skip || 0
        User
            .find({}, { salt: 0, encrypted_password: 0, profilePhoto: 0 })
            .limit(limit)
            .skip(limit * skip)
            .sort({ createdAt: -1 })
            .exec((err, user) => {
                if (err || !user) {
                    return res.status(NOT_FOUND).json({
                        error: 'No users were found in a DB!'
                    })
                }
                res.status(OK).json({
                    message: 'Users Fetched Successfully!',
                    data: user
                })
            })
    } catch (err) {
        loggerUtil(err, 'ERROR')
    } finally {
        loggerUtil('Get All Users Function is Executed')
    }
}

const updateUserById = async (req, res) => {
    try {
        const id = req.params
        User.findOneAndUpdate(id, req.body, { new: true })
            .then(updatedUser => res.status(OK).json({
                status: OK,
                message: "User profile data successfully updated.",
                data: updatedUser
            }))
            .catch(err => res.status(BAD_REQUEST).json({
                status: BAD_REQUEST,
                message: err.message
            }));
    } catch (err) {
        loggerUtil(err, 'ERROR')
    } finally {
        loggerUtil('Get User By Id Function is Executed!')
    }
}


module.exports = { getUserById, getAllUsers, updateUserById }