
const Product = require('../../models/productSchema');
const path = require('path');
const sharp = require('sharp'); 
const fs = require('fs');


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

const editProductPage = async(req,res)=>{
   try {
       const productId = req.params.id;
       const product = await Product.findById(productId);
       if (!product) {
           return res.status(404).json({ success: false, message: 'Product not found' });
       }
       return res.render('showEditProduct', {  product });
   } catch (error) {
       console.error('Error fetching product for edit:', error);
       return res.status(500).json({ success: false, message: 'Internal server error' });
   }
}

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const {
            name,
            price,
            description,
            status,
            language,
            link
        } = req.body;
     console.log("Updating product with ID:", productId);

        // Validate price
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product price"
            });
        }

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Handle images
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


        // Update product fields
        const updatedFields = {
            name,
            price: parsedPrice,
            description,
            status,
            language,
            link,
            images
        };

        await Product.findByIdAndUpdate(productId, updatedFields, { new: true });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully"
        });

    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


const deleteImage = async (req, res) => {
    try {
        const { productId, imageName } = req.body;

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Remove the image from the product's images array
        product.images = product.images.filter(img => img !== imageName);
        await product.save();

        // Delete the image file from the server
        //  const imagePath = path.join(__dirname, "..", "..", "public", "uploads", imageName);
        const fileName = path.basename(imageName);

        const imagePath = path.join(__dirname, "..", "..", "public", "uploads", fileName);

         console.log("Deleting image at path:", imagePath);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error("Error deleting image file:", err);
            }
        });

        return res.status(200).json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
        console.error("Error deleting image:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    getProductPage,
    addProduct,
    viewProducts,
    editProductPage,
    updateProduct,
    deleteImage
};
