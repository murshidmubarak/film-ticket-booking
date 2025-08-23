const User = require('../../models/userSchema');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Product = require('../../models/productSchema'); // Assuming you have a Product model
const Order = require('../../models/orderSchema'); // Assuming you have an Order model
const productTiming = require('../../models/productTimingSchema'); // Assuming you have a ProductTiming model


function generateOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}

async function sendEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                 user: process.env.VERIFY_EMAIL,
                pass: process.env.VERIFY_PASSWORD
            }
        });

       const info = await transporter.sendMail({
            from: process.env.VERIFY_EMAIL,
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is ${otp}`,
        });
        return info.accepted.length > 0;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
        
    }
}


const loadSignup = (req, res) => {
    try {
      
        return res.render('signup');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        
    }
}

const signup = async (req, res) => {
  
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
    


        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = generateOtp();
        console.log('Generated OTP:', otp);
        const emailSent = await sendEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }

        req.session.userOtp = otp;
        req.session.otpExpiry = Date.now() + 60 * 1000; 
        req.session.userData = {
            name,
            email,
            password: hashedPassword,
        };

       res.status(200).json({ success: true, message: 'OTP sent to your email' });

     } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const loadVerifyOtp = (req, res) => {
    try {
       
        return res.render('verify-otp');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const verifyOtp = async (req, res) => {
    try {
      
        const {otp} = req.body;
        
        if (!otp) {
            return res.status(400).json({success: false, message: 'OTP is required' });
        }

        if (String(otp) !== String(req.session.userOtp)) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        const userData = req.session.userData;
        const newUser = new User(userData);
        await newUser.save();

        req.session.userOtp = null;
                req.session.user = {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                };

        res.status(200).json({ success: true, message: 'Signup successful' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
        
    }
}

const resendOtp = async(req,res)=>{
    try {
        const email = req.session.userData.email;
        const otp = generateOtp();
        console.log('Resending OTP:', otp);
        const emailSent = await sendEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Failed to resend OTP' });
        }

        req.session.userOtp = otp;
        req.session.otpExpiry = Date.now() + 60 * 1000; 

        res.status(200).json({ success: true, message: 'OTP resent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const loadLogin = (req, res) => {
    try {
        return res.render('login');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}



const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

           req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
        };

        res.status(200).json({ success: true, message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const logout = async(req,res)=>{
    const resetSession = req.session;
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/')
    });
}


// const loadHome = async (req, res) => {
//     try {
//         const user = req.session.user;

//         const products = await Product.find({});
//         const timings = await productTiming.find({});
//         return res.render('home', { products, user, timings });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// }

const loadHome = async (req, res) => {
    try {
        const user = req.session.user;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get timings where endDate >= today
        const validTimings = await productTiming.find({
            endDate: { $gte: today }
        }).populate("productId");

        // Collect unique products from valid timings
        const runningProductsMap = new Map();
        const productsWithShows = new Map();

        validTimings.forEach(timing => {
            if (timing.productId) {
                productsWithShows.set(timing.productId._id.toString(), true);

                if (timing.productId.status === "Running") {
                    runningProductsMap.set(timing.productId._id.toString(), timing.productId);
                }
            }
        });

        const runningProducts = Array.from(runningProductsMap.values());

        // Fetch all products for upcoming movies section separately
        const allProducts = await Product.find();

        return res.render("home", {
            user,
            products: allProducts,
            runningProducts,
            timings: validTimings,
            productsWithShows // <-- ✅ pass this to EJS
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};





const myOrders = async (req,res)=>{
    try {
        const user = req.session.user
        if(!user){
            return res.redirect('/login')
        }
             const orders = await Order.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .lean();        return res.render('my-orders', { orders, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

// const  movieDetails = async(req,res)=>{
//    try {
//        const movieId = req.params.id;
//        const movie = await Product.findById(movieId).lean();
       
//        if (!movie) {
//            return res.status(404).json({ message: 'Movie not found' });
//        }
//        return res.render('movie-details',{ movie });
//    } catch (error) {
//        console.error(error);
//        res.status(500).json({ message: 'Internal server error' });
//    }
// }
const movieDetails = async (req, res) => {
    try {
        const movieId = req.params.id;

        // Find movie details
        const movie = await Product.findById(movieId).lean();
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Check if movie has any timings assigned
        const timings = await productTiming.find({ productId: movieId }).lean();

        const hasTimings = timings.length > 0;

        return res.render('movie-details', { movie, hasTimings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const forgotPasspage = async(req,res)=>{

    try {
        res.render('forgotPasspage')
        
    } catch (error) {
        console.log("error getting forgot pass page",err)
        
    }

}

const forgotPassPost = async (req, res) => {
    try {
        console.log("forgotPassPost called");
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate OTP
        const otp = generateOtp();
        console.log("Generated OTP:", otp);

        // Send OTP via email
        const emailSent = await sendEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }

        // Store OTP and email in session
        req.session.resetOtp = otp;
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        req.session.resetEmail = email;
        console.log("OTP and email stored in session");

        return res.status(200).json({ success: true, message: 'OTP sent to your email' });

    } catch (error) {
        console.error("Error in forgotPassPost:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const loadVerifyOtpForgot = (req, res) => {
    try {
        res.render('verify-otp-forgot');
    } catch (error) {
        console.error("Error loading verify OTP forgot page:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const verifyOtpForgot = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ success: false, message: 'OTP is required' });
        }

        if (String(otp) !== String(req.session.resetOtp)) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Clear OTP from session
        req.session.resetOtp = null;

        // Redirect to reset password page
        res.status(200).json({ success: true, message: 'OTP verified successfully' });

    } catch (error) {
        console.error("Error in verifyOtpForgot:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const resendOtpForgot = async (req, res) => {
    try {
        const email = req.session.resetEmail;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Generate new OTP
        const otp = generateOtp();
        console.log("Generated OTP:", otp);

        // Send new OTP via email
        const emailSent = await sendEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }

        // Update OTP and expiry in session
        req.session.resetOtp = otp;
        req.session.otpExpiry = Date.now() + 5 * 60 * 1000;
        console.log("New OTP and email stored in session");

        return res.status(200).json({ success: true, message: 'New OTP sent to your email' });

    } catch (error) {
        console.error("Error in resendOtpForgot:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const resetPassword = async(req,res)=>{
    try {
        console.log("resetPassword called");
        return res.render('reset-password');
    } catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const updatePassword = async(req,res)=>{
    try {
        console.log("updatePassword called");
        const { password } = req.body;


        const email = req.session.resetEmail;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Session expired. Please try again.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        req.session.resetEmail = null;
        req.session.user = {
            _id: user._id,
            email: user.email,
            name: user.name
        };

        return res.status(200).json({ success: true, message: 'Password updated successfully. Please log in.' });

    } catch (error) {
        console.error("Error in updatePassword:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    loadSignup,
    signup,
    loadLogin,
    login,
    verifyOtp,
    loadVerifyOtp,
    loadHome,
    myOrders,
    logout,
    movieDetails,
    resendOtp,
    forgotPasspage,
    forgotPassPost,
    loadVerifyOtpForgot,
    verifyOtpForgot,
    resendOtpForgot,
    resetPassword,
    updatePassword
};
