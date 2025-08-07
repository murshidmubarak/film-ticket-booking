const Product = require('../../models/productSchema'); // Assuming you have a Product model
const ProductTiming = require('../../models/productTimingSchema'); // Assuming you have a ProductTiming model


const loadSetTime = async (req, res) => {
    try {
        const productId = req.params.id;
        const productDetails = await Product.findById(productId);
        if (!productDetails) {
            return res.status(404).send('Product not found');
        }           

        res.render('addShowTime', { product: productDetails });
    } catch (error) {
        console.error('Error loading product details:', error);
        res.status(500).send('Internal Server Error');
    }
};

const postLoadSetTime = async (req, res) => {

    try {
        const { productId, startDate, endDate, showTimes, screenNumbers } = req.body;
        

        const newSlots = showTimes.map((time, index) => ({
            time,
            screen: parseInt(screenNumbers[index])
        }));
        console.log('New slots:', newSlots);

        const existingTimings = await ProductTiming.find({
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(startDate) }
        });
        console.log('Existing timings:', existingTimings);

        const conflict = existingTimings.some(timing =>
            timing.showTimes.some(existingSlot =>
                newSlots.some(newSlot =>
                    existingSlot.time === newSlot.time &&
                    existingSlot.screen === newSlot.screen
                )
            )
        );


        if (conflict) {
            return res.status(400).json({success: false, message: 'Show time conflict detected'});
        }

        const productTiming = new ProductTiming({
            productId: productId,
            startDate: startDate,
            endDate: endDate,
            showTimes: newSlots
        });

        await productTiming.save();
        res.status(201).json({success: true, message: 'Show time added successfully'});

    } catch (error) {
        console.error('Error posting set time:', error);
        res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};


module.exports = {
    loadSetTime,
    postLoadSetTime
};
