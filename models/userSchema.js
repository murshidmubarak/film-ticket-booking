const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: true,
    },
   
    isAdmin: {
        type: Boolean,
        default: false,
    },
    createdOn: {
        type: Date,
        default: Date.now,
    }
}, { timestamps: true });

 const User = mongoose.model('User', userSchema);
 module.exports = User;
