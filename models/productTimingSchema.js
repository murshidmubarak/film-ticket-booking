const mongoose = require('mongoose');

const productTimingSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    showTimes: [{
        time: {
            type: String,
            required: true
        },
        screen: {
            type: Number,
            required: true
        }
    }]
});

const ProductTiming = mongoose.model('ProductTiming', productTimingSchema);
module.exports = ProductTiming;
