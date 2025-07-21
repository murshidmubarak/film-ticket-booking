const router = require('express').Router();
const express = require('express');
const userController = require('../controller/user/userController');


router.get('/signup', userController.loadSignup); 
router.post('/signup', userController.signup);
router.get("/login", userController.loadLogin);
router.post('/login', userController.login);
router.get('/verify-otp', userController.loadVerifyOtp);
router.post('/verify-otp', userController.verifyOtp);
router.get('/', userController.loadHome);

module.exports = router;