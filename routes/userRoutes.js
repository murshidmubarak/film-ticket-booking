const router = require('express').Router();
const express = require('express');
const userController = require('../controller/user/userController');
const timeController = require('../controller/user/timeController');


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

module.exports = router;