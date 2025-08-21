const express = require('express');
const User = require('../../models/userSchema');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Product = require('../../models/productSchema'); // Assuming you have a Product model
const Order = require('../../models/orderSchema'); // Assuming you have an Order model


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


const loadHome = async (req, res) => {
    try {
        const user = req.session.user;

        const products = await Product.find({});
        return res.render('home', { products, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

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

const  movieDetails = async(req,res)=>{
   try {
       const movieId = req.params.id;
       const movie = await Product.findById(movieId).lean();
       
       if (!movie) {
           return res.status(404).json({ message: 'Movie not found' });
       }
       return res.render('movie-details',{ movie });
   } catch (error) {
       console.error(error);
       res.status(500).json({ message: 'Internal server error' });
   }
}


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
    resendOtp
};
