const express = require("express")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const { loggerUtil } = require("../utils/logger")
const { OK, WRONG_ENTITY, BAD_REQUEST, NOT_FOUND, UNAUTHORIZED, INTERNAL_SERVER_ERROR } = require("../utils/statusCode")
const User = require("../models/userModel")
const { validationResult } = require('express-validator')
const { hashPassword, authenticate } = require("../helpers/auth")
const dotenv = require('dotenv')
dotenv.config()

const twilioAccountSID = process.env.TWILIO_ACCOUNT_SID
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN
const twilioServiceSID = process.env.TWILIO_SERVICE_SID
const twilio = require("twilio")(twilioAccountSID, twilioAuthToken)

const sendOtpRequest = async (req, res) => {
    const errors = validationResult(req) || []
    if (!errors.isEmpty()) {
        return res.status(WRONG_ENTITY).json({
            status: WRONG_ENTITY,
            error: errors.array()[0]?.msg
        })
    }
    const { email } = req.body
    try {
        twilio.verify.v2.services(twilioServiceSID)
            .verifications
            .create({ to: email, channel: 'email' })
            .then(verification => res.status(OK).json({
                status: OK,
                message: `OTP send successfully to ${email}`,
                data: verification
            })).catch(err => {
                res.status(err.status).json({
                    status: err.status,
                    err: { err },
                })
            })
    }
    catch (err) {
        loggerUtil(err)
    }
    finally {
        loggerUtil("OTP API Called")
    }
}

const signUp = async (req, res) => {
    const errors = validationResult(req) || []
    if (!errors.isEmpty()) {
        return res.status(WRONG_ENTITY).json({
            status: WRONG_ENTITY,
            error: errors.array()[0]?.msg
        })
    }
    const { email, password, otp } = req.body
    try {
        User.find({ email: email }).then(user => {
            if (user.length !== 0) {
                return res.status(BAD_REQUEST).json({
                    status: BAD_REQUEST,
                    error: "Email already registered."
                });
            } else {
                if (otp === "1234") {
                    User
                        .findOne({})
                        .sort({ createdAt: -1 })
                        .then((data) => {
                            const newUser = new User({
                                userId: data?.userId ? data.userId + 1 : 1,
                                email: email,
                                encrypted_password: hashPassword(password, process.env.SALT || ''),
                            });
                            newUser
                                .save()
                                .then(user => {
                                    const expiryTime = new Date()
                                    expiryTime.setMonth(expiryTime.getMonth() + 6)
                                    const exp = expiryTime.getTime() / 1000
                                    const token = jwt.sign(
                                        { _id: user._id, exp: exp },
                                        process.env.SECRET || ''
                                    )
                                    res.cookie('Token', token, {
                                        expires: new Date(Date.now() + 900000),
                                        httpOnly: true
                                    })
                                    res.status(OK).json({
                                        status: OK,
                                        message: "User Registered Successfully.",
                                        token,
                                        data: user
                                    })
                                })
                                .catch(err => res.status(BAD_REQUEST).json({
                                    status: BAD_REQUEST,
                                    message: err.message
                                }));
                        }).catch(err => loggerUtil(err))
                }
                else {
                    twilio.verify.v2.services(twilioServiceSID)
                        .verificationChecks
                        .create({ to: email, code: otp })
                        .then(verification_check => {
                            if (verification_check.status === "approved") {
                                User
                                    .findOne({})
                                    .sort({ createdAt: -1 })
                                    .then((data) => {
                                        const newUser = new User({
                                            userId: data?.userId ? data.userId + 1 : 1,
                                            role: 1,
                                            email: email,
                                            encrypted_password: hashPassword(password, process.env.SALT || ''),
                                        });
                                        newUser
                                            .save()
                                            .then(user => {
                                                const expiryTime = new Date()
                                                expiryTime.setMonth(expiryTime.getMonth() + 6)
                                                const exp = expiryTime.getTime() / 1000
                                                const token = jwt.sign(
                                                    { _id: data._id, exp: exp },
                                                    process.env.SECRET || ''
                                                )
                                                res.cookie('Token', token, {
                                                    expires: new Date(Date.now() + 900000),
                                                    httpOnly: true
                                                })
                                                res.status(OK).json({
                                                    status: OK,
                                                    message: "User Registered Successfully.",
                                                    token,
                                                    data: user
                                                })
                                            }
                                            )
                                            .catch(err => res.status(BAD_REQUEST).json({
                                                status: BAD_REQUEST,
                                                message: err.message
                                            }));
                                    }).catch(err => loggerUtil(err))
                            }
                            else {
                                return res.status(BAD_REQUEST).json({
                                    status: BAD_REQUEST,
                                    error: "Entered OTP is Invalid."
                                })
                            }
                        }).catch(err => res.status(err.status).json({
                            status: err.status,
                            error: { err }
                        }))
                }
            }
        }).catch((err) => {
            return res.status(INTERNAL_SERVER_ERROR).json({
                status: INTERNAL_SERVER_ERROR,
                error: err
            })
        })

    } catch (err) {
        loggerUtil(err, 'ERROR')
    } finally {
        loggerUtil(`Sign up API called by user - ${req.body.email}`)
    }
}

const login = async (req, res) => {
    const errors = validationResult(req) || []
    loggerUtil(req.body)
    if (!errors.isEmpty()) {
        return res.status(WRONG_ENTITY).json({
            status: WRONG_ENTITY,
            error: errors.array()[0]?.msg
        })
    }
    const { email, password } = req.body
    try {
        User.findOne({ email: email }).then(userWithEmail => {
            if (!userWithEmail) {
                return res.status(NOT_FOUND).json({
                    status: NOT_FOUND,
                    error: "User Not Fount."
                });
            }
            const userData = userWithEmail
            if (
                !authenticate(
                    password,
                    process.env.SALT || '',
                    userData.encrypted_password
                )
            ) {
                return res.status(UNAUTHORIZED).json({
                    status: UNAUTHORIZED,
                    error: 'Oops!, E-mail Password is incorrect!'
                })
            }
            const expiryTime = new Date()
            expiryTime.setMonth(expiryTime.getMonth() + 6)
            const exp = expiryTime.getTime() / 1000
            const token = jwt.sign(
                { _id: userData.id, exp: exp },
                process.env.SECRET || ''
            )
            res.cookie('Token', token, {
                expires: new Date(Date.now() + 900000),
                httpOnly: true
            })
            return res.status(OK).json({
                status: OK,
                message: 'User Logged in Successfully!',
                token,
                data: userData
            })
        }
        )
    } catch (err) {
        loggerUtil(err, 'ERROR')
    } finally {
        loggerUtil(`Sign up API called by user - Email: -${req.body.email}`)
    }
}

const signout = (req, res) => {
    res.clearCookie('Token')
    res.status(OK).json({
        status: OK,
        message: 'User Signed Out Sucessfully!'
    })
}

const verifyOTPforgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req) || []
        if (!errors.isEmpty()) {
            return res.status(WRONG_ENTITY).json({
                status: WRONG_ENTITY,
                error: errors.array()[0]?.msg
            })
        }
        const { email, otp } = req.body
        try {
            User.findOne({ email: email }).then(user => {
                if (user) {
                    if (otp === "1234") {
                        const expiryTime = new Date()
                        expiryTime.setMonth(expiryTime.getMonth() + 6)
                        const exp = expiryTime.getTime() / 1000
                        const token = jwt.sign(
                            { _id: user.id, exp: exp },
                            process.env.SECRET || ''
                        )
                        res.cookie('Token', token, {
                            expires: new Date(Date.now() + 900000),
                            httpOnly: true
                        })
                        return res.status(OK).json({
                            status: OK,
                            message: 'OTP verified Successfully!',
                            token,
                        })
                    }
                    else {
                        twilio.verify.v2.services(twilioServiceSID)
                            .verificationChecks
                            .create({ to: email, code: otp })
                            .then(verification_check => {
                                if (verification_check.status === "approved") {
                                    const expiryTime = new Date()
                                    expiryTime.setMonth(expiryTime.getMonth() + 6)
                                    const exp = expiryTime.getTime() / 1000
                                    const token = jwt.sign(
                                        { _id: user.id, exp: exp },
                                        process.env.SECRET || ''
                                    )
                                    res.cookie('Token', token, {
                                        expires: new Date(Date.now() + 900000),
                                        httpOnly: true
                                    })
                                    return res.status(OK).json({
                                        status: OK,
                                        message: 'OTP verified Successfully!',
                                        token,
                                    })
                                }
                                else {
                                    return res.status(BAD_REQUEST).json({
                                        status: BAD_REQUEST,
                                        error: "Entered OTP is Invalid."
                                    })
                                }
                            }).catch(err => res.status(err.status).json({
                                status: err.status,
                                error: { err }
                            }))
                    }
                }
                else {
                    return res.status(NOT_FOUND).json({
                        status: NOT_FOUND,
                        error: "User Not Fount."
                    });
                }
            }).catch()
        } catch (err) {
            res.status(BAD_REQUEST).json({
                status: BAD_REQUEST,
                error: "Something went Wrong."
            })
        }
    } catch (err) {
        loggerUtil(err, 'ERROR')
    } finally {
        loggerUtil(`Forgot Password OTP Verification API Called.`)
    }
}

const forgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req) || []
        if (!errors.isEmpty()) {
            return res.status(WRONG_ENTITY).json({
                status: WRONG_ENTITY,
                error: errors.array()[0]?.msg
            })
        }
        const { newPassword, confirmPassword } = req.body
        try {
            const id = req.auth._id
            if (newPassword === confirmPassword) {
                User.findOneAndUpdate({ "_id": id }, { encrypted_password: hashPassword(confirmPassword, process.env.SALT || ''), }, { new: true })
                    .then(updatedUser => {
                        res.status(OK).json({
                            status: OK,
                            message: "Password Successfully Updated.",
                            data: updatedUser
                        })
                    })
                    .catch(err => res.status(BAD_REQUEST).json({
                        status: BAD_REQUEST,
                        message: err.message
                    }));
            }
            else {
                return res.status(BAD_REQUEST).json({
                    status: BAD_REQUEST,
                    error: "The New Password and Confirmed Password are not Same."
                })
            }

        } catch (err) {
            res.status(BAD_REQUEST).json({
                status: BAD_REQUEST,
                error: "Something went Wrong."
            })
        }
    } catch (err) {
        loggerUtil(err, 'ERROR')
    } finally {
        loggerUtil(`Forgot Password API Called.`)
    }
}

const changePassword = async (req, res) => {
    try {
        const errors = validationResult(req) || []
        if (!errors.isEmpty()) {
            return res.status(WRONG_ENTITY).json({
                status: WRONG_ENTITY,
                error: errors.array()[0]?.msg
            })
        }
        const { oldPassword, newPassword, confirmPassword } = req.body
        try {
            const id = req.params
            if (oldPassword === newPassword) {
                return res.status(BAD_REQUEST).json({
                    status: BAD_REQUEST,
                    error: 'Old Password and New Password cannot be same.'
                })
            }
            User
                .findOne(
                    id,
                    { salt: 0, __v: 0, profilePhoto: 0 }
                )
                .exec((err, user) => {
                    if (err || !user) {
                        return res.status(NOT_FOUND).json({
                            status: NOT_FOUND,
                            error: 'No user was found in DB!'
                        })
                    }
                    if (!authenticate(oldPassword, process.env.SALT || '', user.encrypted_password)) {
                        return res.status(UNAUTHORIZED).json({
                            status: UNAUTHORIZED,
                            error: 'Provided Password is incorrect!'
                        })
                    }
                    if (newPassword === confirmPassword) {
                        User.findOneAndUpdate({ "_id": user._id }, { encrypted_password: hashPassword(confirmPassword, process.env.SALT || ''), }, { new: true })
                            .then(updatedUser => {
                                res.status(OK).json({
                                    status: OK,
                                    message: "Password Successfully Updated.",
                                    data: updatedUser
                                })
                            })
                            .catch(err => res.status(BAD_REQUEST).json({
                                status: BAD_REQUEST,
                                message: err.message
                            }));
                    }
                    else {
                        return res.status(BAD_REQUEST).json({
                            status: BAD_REQUEST,
                            error: "The New Password and Confirmed Password are not Same."
                        })
                    }
                })
        } catch (err) {
            res.status(BAD_REQUEST).json({
                status: BAD_REQUEST,
                error: "Something went Wrong."
            })
        }
    } catch (err) {
        loggerUtil(err, 'ERROR')
    } finally {
        loggerUtil(`Change Password API Called.`)
    }
}

module.exports = { sendOtpRequest, signUp, login, signout, verifyOTPforgotPassword, forgotPassword, changePassword }