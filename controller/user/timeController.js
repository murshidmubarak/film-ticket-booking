const Product = require('../../models/productSchema');
const ProductTiming = require('../../models/productTimingSchema');
const BookedSeats = require('../../models/bookedSeats'); // Import the BookedSeats model



// const loadSetTime = async (req, res) => {
//     try {
//         const user = req.session.user;
//         const productId = req.params.id;

//         if (!user) {
//             return res.status(401).send('Unauthorized');
//         }

//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).send('Film not found');
//         }

//         const allTimings = await ProductTiming.find({ productId });

//         // Current date at midnight (so only today or future)
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const groupedByDate = {};

//         allTimings.forEach(timing => {
//             const start = new Date(timing.startDate);
//             start.setHours(0, 0, 0, 0); // normalize date

//             // Only include if date >= today
//             if (start >= today) {
//                 const dateKey = start.toDateString();

//                 if (!groupedByDate[dateKey]) {
//                     groupedByDate[dateKey] = [];
//                 }

//                 timing.showTimes.forEach(show => {
//                     const [hours, minutes] = show.time.split(':');
//                     const showDateTime = new Date(start);
//                     showDateTime.setHours(hours, minutes, 0, 0)

                    
//                      groupedByDate[dateKey].push({
//                         time: show.time,
//                         screen: show.screen,
//                          dateTimeISO: showDateTime.toISOString()
//                     });
//                 });
//             }
//         });

//         res.render('setTime', {
//             product,
//             user,
//             groupedByDate
//         });
//     } catch (error) {
//         console.error('Error loading set time:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };
const loadSetTime = async (req, res) => {
    try {
        const user = req.session.user;
        const productId = req.params.id;

        if (!user) {
            return res.redirect("/login")
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Film not found');
        }

        const allTimings = await ProductTiming.find({ productId });

        // Current date at midnight (so only today or future)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const groupedByDate = {};

        for (const timing of allTimings) {
            const start = new Date(timing.startDate);
            start.setHours(0, 0, 0, 0);

            // Only include if date >= today
            if (start >= today) {
                const dateKey = start.toDateString();
                if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];

                for (const show of timing.showTimes) {
                    const [hours, minutes] = show.time.split(':');
                    const showDateTime = new Date(start);
                    showDateTime.setHours(hours, minutes, 0, 0);

                    // Get booked seats for this show (match by productId + screen + date + time)
                    const bookedSeatsDocs = await BookedSeats.find({
                        productId,
                        screen: show.screen,
                        date: start.toISOString().split('T')[0], // Make sure your DB stores dates in this format
                        time: show.time
                    });

                    // Count total booked seats
                    const bookedCount = bookedSeatsDocs.reduce((acc, doc) => acc + doc.seats.length, 0);

                    // // You can make total seats dynamic per screen, but here hardcoded = 36
                    // const totalSeats = 36;
                    // const available = totalSeats - bookedCount;

                    // Set total seats dynamically based on screen number
                   let totalSeats;
                   if (show.screen === 1) {
                   totalSeats = 273;  // For Screen 1
                    } else {
                totalSeats = 230;  // For other screens
                    }

                   const available = totalSeats - bookedCount;


                    groupedByDate[dateKey].push({
                        time: show.time,
                        screen: show.screen,
                        dateTimeISO: showDateTime.toISOString(),
                        availableSeats: available
                    });
                }
            }
        }

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

         const bookedSeats = await BookedSeats.find({
            productId,
            screen,
            date: new Date(date), // ensure date matches format
            time
        });

        // Flatten seat arrays
        const bookedSeatsList = bookedSeats.flatMap(bs => bs.seats);
        res.render('book', {
            product,
            user,
            productTiming,
            time,
            date,
            screen,
            tickets,
            bookedSeats: bookedSeatsList
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
        const { name, time, date, screen, selectedSeats, totalAmount } = req.query;

        if (!user) {
            return res.status(401).send('Unauthorized');
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Film not found');
        }

        res.render('orderSummary', {
            productId,
            name,
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