const mongoose = require('mongoose');

const bookedSeatsSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    screen: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    seats: {
        type: [String], // Example: ["A1", "A2", "B5"]
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    }
}, { timestamps: true });

// Ensure no duplicate booking for same seat, screen, date, and time
bookedSeatsSchema.index(
    { screen: 1, date: 1, time: 1, seats: 1 },
    { unique: true }
);

const BookedSeats = mongoose.model('BookedSeats', bookedSeatsSchema);

module.exports = BookedSeats;
