const crypto = require('crypto')

const hashPassword = (password, salt) => {
    if (!password) return ''
    try {
        return crypto.createHmac('sha256', salt).update(password).digest('hex')
    } catch (err) {
        return ''
    }
}

const authenticate = (
    password,
    salt,
    encryptedPassword
) => {
    return hashPassword(password, salt) === encryptedPassword
}

module.exports = {hashPassword , authenticate}