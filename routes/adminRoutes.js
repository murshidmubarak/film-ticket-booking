const router = require('express').Router();
const adminController = require('../controller/admin/adminController');
const productController = require('../controller/admin/productController');
const multer = require('multer');
const upload = require('../middleweares/multer');
const addShowTimeController = require('../controller/admin/addShowTime');


router.get('/login', adminController.loadAdminLogin);
router.post('/login', adminController.adminLogin);
router.get('/addProduct',  adminController.loadDashboard);
router.post('/addProduct', upload.array('productImages', 5), productController.addProduct); // Changed to handle multiple images
router.get('/products', productController.viewProducts);
router.get('/setShowTime/:id', addShowTimeController.loadSetTime); // Updated route to match the controller method
router.post('/setShowTime', addShowTimeController.postLoadSetTime); // Added route for posting show time data
module.exports = router;