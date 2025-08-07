
const Product = require('../../models/productSchema');
const path = require('path');
const sharp = require('sharp'); 


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

        const { productName, productPrice, productDescription, productStatus, productLanguage, productLink } = req.body;

     

        // Check for existing product
        const existingProduct = await Product.findOne({
           name: { $regex: new RegExp(`^${productName.trim()}$`, 'i') }
        });

        if (existingProduct) {
             return res.status(400).json({ success: false, message: 'Product already exists' });
        }

       const images = [];

for (let i = 0; i < req.files.length; i++) {
    const { path: inputPath, originalname } = req.files[i];
    const ext = path.extname(originalname);
    const resizedName = 'resized_' + Date.now() + '_' + i + ext;
    const outputPath = path.join('public', 'uploads', resizedName);

    await sharp(inputPath)
        .resize(800, 800)
        .toFile(outputPath);

    images.push(path.join('uploads', resizedName)); // for use in <img src="/uploads/..." />
}


        // Create new product
        const newProduct = new Product({
            name: productName.trim(),
            price: parseFloat(productPrice),
            description: productDescription.trim(),
            images: images,
            status: productStatus,
            language: productLanguage,
            link: productLink.trim()
        });

        // Save product to database
        await newProduct.save();
        console.log('Product saved successfully:', newProduct);

        // Redirect with success message
        return res.status(200).json({ success: true, message: 'Product added successfully' });
    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const viewProducts = async (req, res) => {
    try {
        const products = await Product.find();
        return res.render('showProducts', { products });
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    getProductPage,
    addProduct,
    viewProducts
};
