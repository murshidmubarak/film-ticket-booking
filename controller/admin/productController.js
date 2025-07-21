
const express = require('express');
const Product = require('../../models/productSchema');
const multer = require('multer');
const path = require('path');

const getProductPage = async (req, res) => {
    try {
        console.log('Loading product page');
        return res.render('addProduct');
    } catch (error) {
        console.error('Error loading product page:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const addProduct = async (req, res) => {
    try {
        const { productName, productPrice, productDescription } = req.body;
        console.log('Received form data:', { productName, productPrice, productDescription, file: req.file?.filename });

        // Validate required fields
        if (!productName || !productPrice || !productDescription) {
            console.log('Missing required fields');
            return res.redirect('/addProduct?error=Name,%20price,%20and%20description%20are%20required');
        }

        // Check for existing product
        const existingProduct = await Product.findOne({
            productName: { $regex: new RegExp(`^${productName.trim()}$`, 'i') }
        });
        if (existingProduct) {
            console.log('Product already exists:', productName);
            return res.redirect('/addProduct?error=Product%20already%20exists');
        }

        // Handle uploaded image
        const imagePath = req.file ? req.file.path : null;
        console.log('Image path:', imagePath);

        // Create new product
        const newProduct = new Product({
            productName: productName.trim(),
            productPrice: parseFloat(productPrice),
            productDescription: productDescription.trim(),
            images: imagePath ? [path.basename(imagePath)] : []
        });

        // Save product to database
        await newProduct.save();
        console.log('Product saved successfully:', newProduct);

        // Redirect with success message
        return res.redirect('/addProduct?success=Product%20added%20successfully');
    } catch (error) {
        console.error('Error adding product:', error);
        return res.redirect('/addProduct?error=Internal%20server%20error');
    }
};

module.exports = {
    getProductPage,
    addProduct
};
