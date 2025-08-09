const crypto = require('crypto');
const razorpayInstance = require('../../config/razorpay');
const Order = require('../../models/orderSchema');
const QRCode = require('qrcode'); // fixed name


const createOrder = async (req, res) => {
    try {
        const { amount, date, time, screen, selectedSeats } = req.body;
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
            userId: user._id, // Ensure user is logged in
            amount,
            date,
            time,
            screen,
            selectedSeats,
            status: "pending",
            razorpayOrderId: razorpayOrder.id,
            orderId: myOrderId
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

        if (expectedSignature !== razorpay_signature) {
            return res.json({ success: false, message: "Payment verification failed!" });
        }
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (!order) {
            return res.status(404).json({ error: "Order not found!" });
        }

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

        await order.save();

        res.json({ success: true, qrCode: qrCodeImage });
        






        // res.json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        const order = await Order.findOne({ razorpayOrderId: req.body.razorpay_order_id });
        order.status = "failed";
        await order.save();
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};
