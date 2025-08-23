const router = require('express').Router();
const userController = require('../controller/user/userController');
const timeController = require('../controller/user/timeController');
const orderController = require('../controller/user/orderController');
const { noCache, paymentNoCache,userAuth,isLogin } = require('../middleweares/auth');

router.get('/signup', userController.loadSignup); 
router.post('/signup', userController.signup);
router.get("/login",isLogin, userController.loadLogin);
router.post('/login',isLogin, userController.login);
router.post('/logout',userController.logout)
router.get('/verify-otp', userController.loadVerifyOtp);
router.post('/verify-otp', userController.verifyOtp);
router.post('/resend-otp', userController.resendOtp);
router.get('/', userController.loadHome);
router.get('/movies/:id', userController.movieDetails);
router.get('/forget-password',userController.forgotPasspage)
router.post('/forget-password', userController.forgotPassPost)
router.get('/verify-otp-forgot', userController.loadVerifyOtpForgot);
 router.post('/verify-otp-forgot', userController.verifyOtpForgot);
router.post('/resend-otp-forgot', userController.resendOtpForgot);
router.get('/reset-password', userController.resetPassword);
router.post('/reset-password', userController.updatePassword);

router.get('/setTime/:id', noCache, timeController.loadSetTime);
router.get('/book/:id', noCache, userAuth, timeController.loadBook);
router.get('/orderSummary/:id', noCache, userAuth, timeController.loadOrderSummary);

// Enhanced cache prevention for payment routes
router.post('/create-order', paymentNoCache,userAuth, orderController.createOrder);
router.post('/verify-payment', paymentNoCache,userAuth, orderController.verifyPayment);
router.post("/payment-failed",paymentNoCache,userAuth,orderController. markPaymentFailed);


router.get('/my-orders', noCache, userController.myOrders);

module.exports = router;