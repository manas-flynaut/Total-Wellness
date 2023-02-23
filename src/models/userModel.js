const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userId: { type: Number, required: [true, "Please add userId."] },
    name: { type: String, trim: true, },
    countryCode: { type: Number },
    phone: { type: Number, unique: false },
    email: { type: String, unique: [true, "Email already registered."], required: [true, "Please add Email."], trim: true, },
    dob: { type: String },
    bio: { type: String, trim: true },
    address: { type: String },
    encrypted_password: { type: String, required: [true, "Please add password"] },
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User