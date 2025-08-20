const express = require('express');
const User = require('../../models/userSchema');
const bcrypt = require('bcrypt');

const loadAdminLogin = (req, res) => {
    try {
        console.log('Loading admin login page');
        return res.render('adminLogin');
    } catch (error) {
        console.error('Error loading admin login:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email });
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({ success: false, message: 'Invalid email' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for:', email);
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }
        if (!user.isAdmin) {
            console.log('User is not admin:', email);
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        req.session.user = { id: user._id, email: user.email, isAdmin: user.isAdmin };
        console.log('Session set:', req.session.user);
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ success: false, message: 'Session error' });
            }
            console.log('Session saved successfully');
            if (req.xhr || req.headers.accept.includes('json')) {
                console.log('Sending JSON response for AJAX login');
                return res.status(200).json({ success: true, message: 'Login successful' });
            }
            console.log('Redirecting to /admin/dashboard for non-AJAX');
            return res.redirect('/admin/dashboard');
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const loadDashboard = (req, res) => {
    try {
        
        return res.render('addProduct');
    } catch (error) {
        console.error('Dashboard load error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const editProductPage = async(req,res)=>{
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        return res.render('editProduct', { product });
    } catch (error) {
        console.error('Error loading edit product page:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


module.exports = {
    loadAdminLogin,
    adminLogin,
    loadDashboard,
    editProductPage
};