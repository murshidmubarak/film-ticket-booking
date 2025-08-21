const router = require('express').Router();
const adminController = require('../controller/admin/adminController');
const productController = require('../controller/admin/productController');
const multer = require('multer');
const upload = require('../middleweares/multer');
const addShowTimeController = require('../controller/admin/addShowTime');
const{adminAuth} = require('../middleweares/auth');


router.get('/login', adminController.loadAdminLogin);
router.post('/login', adminController.adminLogin);
router.get('/addProduct',adminAuth,  adminController.loadDashboard);
router.post('/addProduct',adminAuth, upload.array('productImages', 5), productController.addProduct); // Changed to handle multiple images
router.get('/products',adminAuth, productController.viewProducts);
router.get('/products/edit/:id', productController.editProductPage);
// router.post('/products/edit/:id', upload.array('productImages', 5), productController.updateProduct);
router.post('/editProduct/:id',adminAuth, upload.array('images', 5), productController.updateProduct);
router.post("/deleteImage",adminAuth, productController.deleteImage);




router.get('/setShowTime/:id',adminAuth, addShowTimeController.loadSetTime); // Updated route to match the controller method
router.post('/setShowTime',adminAuth, addShowTimeController.postLoadSetTime); // Added route for posting show time data
module.exports = router;