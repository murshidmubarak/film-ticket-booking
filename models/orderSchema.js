const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    screen: {
        type: String,
        required: true
    },
    selectedSeats: {
        type: [String],
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
    qrCode: {
        type: String,
    
    },
    name: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
