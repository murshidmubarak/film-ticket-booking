
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    images: { // Changed from 'image' to 'images' to match array type
        type: [String],
        required: false // Changed to false to allow products without images
    },
    status:{
        type:String,
        required:true,
        enum:['Running','Upcoming'],
        trim:true
    },
    language:{
        type:String,
        required:true,
        trim:true
    },
    link:{
        type:String,
        required:true,
        trim:true
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;