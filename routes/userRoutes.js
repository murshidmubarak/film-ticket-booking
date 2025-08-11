const router = require('express').Router();
const express = require('express');
const userController = require('../controller/user/userController');
const timeController = require('../controller/user/timeController');
const orderController = require('../controller/user/orderController');


router.get('/signup', userController.loadSignup); 
router.post('/signup', userController.signup);
router.get("/login", userController.loadLogin);
router.post('/login', userController.login);
router.get('/verify-otp', userController.loadVerifyOtp);
router.post('/verify-otp', userController.verifyOtp);
router.get('/', userController.loadHome);

router.get('/setTime/:id', timeController.loadSetTime);
router.get('/book/:id', timeController.loadBook);
router.get('/orderSummary/:id', timeController.loadOrderSummary);

router.post('/create-order', orderController.createOrder);
 router.post('/verify-payment', orderController.verifyPayment);

 router.get('/my-orders',userController.myOrders)

module.exports = router;