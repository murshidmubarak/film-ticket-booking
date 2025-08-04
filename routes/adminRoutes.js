const router = require('express').Router();
const adminController = require('../controller/admin/adminController');
const productController = require('../controller/admin/productController');
const multer = require('multer');
const upload = require('../middleweares/multer');


router.get('/login', adminController.loadAdminLogin);
router.post('/login', adminController.adminLogin);
router.get('/addProduct',  adminController.loadDashboard);
router.post('/addProduct', upload.array('productImages', 5), productController.addProduct); // Changed to handle multiple images

module.exports = router;