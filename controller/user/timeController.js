const User = require('../../models/userSchema');
const Product = require('../../models/productSchema');
const ProductTiming = require('../../models/productTimingSchema');
const Razorpay = require('../../config/razorpay');



const loadSetTime = async (req, res) => {
    try {
        const user = req.session.user;
        const productId = req.params.id;

        if (!user) {
            return res.status(401).send('Unauthorized');
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Film not found');
        }

        const allTimings = await ProductTiming.find({ productId });

        // Group timings by date string (e.g., "Wed Aug 06 2025")
        const groupedByDate = {};

        allTimings.forEach(timing => {
            const start = new Date(timing.startDate);
            const dateKey = start.toDateString();

            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = [];
            }

            timing.showTimes.forEach(show => {
                groupedByDate[dateKey].push({
                    time: show.time,
                    screen: show.screen
                });
            });
        });

        res.render('setTime', {
            product,
            user,
            groupedByDate
        });
    } catch (error) {
        console.error('Error loading set time:', error);
        res.status(500).send('Internal Server Error');
    }
};

const loadBook = async (req, res) => {
    try {
        const user = req.session.user;
        const productId = req.params.id;
        const {time,date,screen,tickets} = req.query;
        if (!user) {
            return res.status(401).send('Unauthorized');
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Film not found');
        }
        const productTiming = await ProductTiming.findOne({ productId: productId });
        if (!productTiming) {
            return res.status(404).send('No timings available for this film');
        }
        res.render('book', {
            product,
            user,
            productTiming,
            time,
            date,
            screen,
            tickets
        });


    } catch (error) {
        console.error('Error loading book:', error);
        res.status(500).send('Internal Server Error');
    }
}

const loadOrderSummary = async (req, res) => {
    try {
        const user = req.session.user;
        const productId = req.params.id;
        const { time, date, screen, selectedSeats, totalAmount } = req.query;

        if (!user) {
            return res.status(401).send('Unauthorized');
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Film not found');
        }

        res.render('orderSummary', {
            product,
            user,
            time,
            date,
            screen,
            selectedSeats: selectedSeats ? JSON.parse(selectedSeats) : [],
            totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error loading order summary:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    loadSetTime,
    loadBook,
    loadOrderSummary
};