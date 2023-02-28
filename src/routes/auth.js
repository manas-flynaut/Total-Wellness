// import { forgotPassword } from './../controllers/auth'
const express = require('express')
const { check, body } = require('express-validator')
const { isSignedIn, isValidToken, isSameUserOrAdmin } = require('./../middleware/index')
const { sendOtpRequest, signUp, login, signout, verifyOTPforgotPassword, forgotPassword, changePassword } = require("../controllers/auth")

const authRoute = express.Router()

authRoute.post(
    '/sendOtp',
    [check('email').isEmail().withMessage('Please provide a valid E-Mail!')],
    sendOtpRequest
)

authRoute.post(
    '/signup',
    [
        check('email').isEmail().withMessage('Please provide a valid E-Mail!'),
        check('password')
            .isLength({ min: 8 })
            .withMessage('Password length should be minimum of 8 characters'),
        check('otp')
            .isLength({ min: 4 })
            .withMessage('OTP Length should be 4 digits')
    ],
    signUp
)

authRoute.post(
    '/login',
    [
        check('email').isEmail().withMessage('Please provide a valid E-Mail!'),
        check('password')
            .isLength({ min: 8 })
            .withMessage('Password length should be minimum of 8 characters')
    ],
    login
)

authRoute.get('/signout', signout)

authRoute.post('/verify-otp/forgot-password',
    [
        check('email').isEmail().withMessage('Please provide a valid E-Mail!'),
        check('otp')
            .isLength({ min: 4 })
            .withMessage('OTP Length should be 4 digits')
    ],
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match password');
        }
        // Indicates the success of this synchronous custom validator
        return true;
    }),
    verifyOTPforgotPassword
)

authRoute.post('/forgot-password',
    isSignedIn,
    isValidToken,
    [
        check('newPassword')
            .isLength({ min: 8 })
            .withMessage('New Password length should be minimum of 8 characters'),
    ],
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match password');
        }
        // Indicates the success of this synchronous custom validator
        return true;
    }),
    forgotPassword
)

authRoute.post('/change-password/:userId',
    isSignedIn,
    isValidToken,
    isSameUserOrAdmin,
    [
        check('newPassword')
            .isLength({ min: 8 })
            .withMessage('New Password length should be minimum of 8 characters'),
        check('oldPassword')
            .isLength({ min: 8 })
            .withMessage('Old Password length should be minimum of 8 characters'),

    ],
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error('Password confirmation does not match password');
        }
        // Indicates the success of this synchronous custom validator
        return true;
    }),
    changePassword
)

module.exports = authRoute
