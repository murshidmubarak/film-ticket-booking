// const router = require('express').Router();
// const express = require('express');
// const userController = require('../controller/user/userController');
// const timeController = require('../controller/user/timeController');
// const orderController = require('../controller/user/orderController');
// const { noCache } = require('../middleweares/auth');

// router.get('/signup', userController.loadSignup); 
// router.post('/signup', userController.signup);
// router.get("/login", userController.loadLogin);
// router.post('/login', userController.login);
// router.get('/verify-otp', userController.loadVerifyOtp);
// router.post('/verify-otp', userController.verifyOtp);
// router.get('/', userController.loadHome);

// router.get('/setTime/:id', noCache, timeController.loadSetTime);
// router.get('/book/:id', noCache, timeController.loadBook);
// router.get('/orderSummary/:id', noCache, timeController.loadOrderSummary);

// router.post('/create-order', orderController.createOrder);
//  router.post('/verify-payment', orderController.verifyPayment);

//  router.get('/my-orders',noCache,userController.myOrders)

// module.exports = router;


const router = require('express').Router();
const express = require('express');
const userController = require('../controller/user/userController');
const timeController = require('../controller/user/timeController');
const orderController = require('../controller/user/orderController');
const { noCache, paymentNoCache } = require('../middleweares/auth');

router.get('/signup', userController.loadSignup); 
router.post('/signup', userController.signup);
router.get("/login", userController.loadLogin);
router.post('/login', userController.login);
router.post('/logout',userController.logout)
router.get('/verify-otp', userController.loadVerifyOtp);
router.post('/verify-otp', userController.verifyOtp);
router.post('/resend-otp', userController.resendOtp);
router.get('/', userController.loadHome);
router.get('/movies/:id', userController.movieDetails);

router.get('/setTime/:id', noCache, timeController.loadSetTime);
router.get('/book/:id', noCache, timeController.loadBook);
router.get('/orderSummary/:id', noCache, timeController.loadOrderSummary);

// Enhanced cache prevention for payment routes
router.post('/create-order', paymentNoCache, orderController.createOrder);
router.post('/verify-payment', paymentNoCache, orderController.verifyPayment);

router.get('/my-orders', noCache, userController.myOrders);

module.exports = router;