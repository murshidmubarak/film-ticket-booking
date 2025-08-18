// const crypto = require('crypto');
// const razorpayInstance = require('../../config/razorpay');
// const Order = require('../../models/orderSchema');
// const QRCode = require('qrcode'); // fixed name
// const BookedSeats = require('../../models/bookedSeats'); // Import the BookedSeats model


// const createOrder = async (req, res) => {
//     try {
//         const { name, amount, date, time, screen, selectedSeats, productId } = req.body;
//         const user = req.session.user;

//         // Generate internal orderId
//         const myOrderId = crypto.randomBytes(8).toString("hex");

//         // Create Razorpay order
//         const razorpayOrder = await razorpayInstance.orders.create({
//             amount: amount * 100, // in paise
//             currency: "INR",
//             receipt: myOrderId
//         });

//         // Save order in DB
//         const newOrder = new Order({
//             productId,
//             userId: user._id, 
//             amount,
//             date,
//             time,
//             screen,
//             selectedSeats,
//             status: "pending",
//             razorpayOrderId: razorpayOrder.id,
//             orderId: myOrderId,
//             name
//         });

//         await newOrder.save();

//         // Send Razorpay details to frontend
//         res.json({
//             id: razorpayOrder.id,
//             amount: razorpayOrder.amount,
//             currency: razorpayOrder.currency
//         });

//     } catch (error) {
//         console.error("Error creating Razorpay order:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// const verifyPayment = async (req, res) => {
//     try {
//         const {
//             razorpay_order_id,
//             razorpay_payment_id,
//             razorpay_signature
//         } = req.body;

//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//             .digest("hex");

//         if (expectedSignature !== razorpay_signature) {
//             return res.json({ success: false, message: "Payment verification failed!" });
//         }
//         const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
//         if (!order) {
//             return res.status(404).json({ error: "Order not found!" });
//         }
//         const bookedSeats = new BookedSeats({
//             productId: order.productId, // Assuming productId is part of the order
//             screen: order.screen,
//             date: order.date,
//             time: order.time,
//             seats: order.selectedSeats,
//             orderId: order._id
//         });

//         order.razorpayPaymentId = razorpay_payment_id;
//         order.razorpaySignature = razorpay_signature;
//         order.status = "completed";
        
//          const qrData = {
//             userId: order.userId,
//             amount: order.amount,
//             date: order.date,
//             time: order.time,
//             screen: order.screen,
//             selectedSeats: order.selectedSeats,
//             orderId: order.orderId
//         };

//         const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
//         order.qrCode = qrCodeImage;

//         await bookedSeats.save();
//         await order.save();
         

//         res.json({ success: true, qrCode: qrCodeImage });

//          // res.json({ success: true, message: "Payment verified successfully" });
//     } catch (error) {
//         console.error("Error verifying Razorpay payment:", error);
//         const order = await Order.findOne({ razorpayOrderId: req.body.razorpay_order_id });
//         order.status = "failed";
//         await order.save();
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// module.exports = {
//     createOrder,
//     verifyPayment
// };


const crypto = require('crypto');
const razorpayInstance = require('../../config/razorpay');
const Order = require('../../models/orderSchema');
const QRCode = require('qrcode');
const BookedSeats = require('../../models/bookedSeats');

const createOrder = async (req, res) => {
    try {
        const { name, amount, date, time, screen, selectedSeats, productId } = req.body;
        const user = req.session.user;

        // Generate internal orderId
        const myOrderId = crypto.randomBytes(8).toString("hex");

        // Create Razorpay order
        const razorpayOrder = await razorpayInstance.orders.create({
            amount: amount * 100, // in paise
            currency: "INR",
            receipt: myOrderId
        });

        // Save order in DB
        const newOrder = new Order({
            productId,
            userId: user._id, 
            amount,
            date,
            time,
            screen,
            selectedSeats,
            status: "pending",
            razorpayOrderId: razorpayOrder.id,
            orderId: myOrderId,
            name
        });

        await newOrder.save();

        // Send Razorpay details to frontend
        res.json({
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
        });

    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                error: "Order not found!"
            });
        }

        if (expectedSignature !== razorpay_signature) {
            // Payment verification failed
            order.status = "failed";
            await order.save();
            
            return res.json({ 
                success: false, 
                message: "Payment verification failed!"
            });
        }

        // Payment successful
        const bookedSeats = new BookedSeats({
            productId: order.productId,
            screen: order.screen,
            date: order.date,
            time: order.time,
            seats: order.selectedSeats,
            orderId: order._id
        });

        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.status = "completed";
        
        const qrData = {
            userId: order.userId,
            amount: order.amount,
            date: order.date,
            time: order.time,
            screen: order.screen,
            selectedSeats: order.selectedSeats,
            orderId: order.orderId
        };

        const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
        order.qrCode = qrCodeImage;

        await bookedSeats.save();
        await order.save();

        res.json({ 
            success: true, 
            qrCode: qrCodeImage,
            message: "Payment successful!"
        });

    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        
        try {
            const order = await Order.findOne({ razorpayOrderId: req.body.razorpay_order_id });
            if (order) {
                order.status = "failed";
                await order.save();
            }
        } catch (dbError) {
            console.error("Error updating order status:", dbError);
        }
        
        res.status(500).json({ 
            success: false,
            error: "Internal Server Error"
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};