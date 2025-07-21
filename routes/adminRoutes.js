const router = require('express').Router();
const adminController = require('../controller/admin/adminController');
const productController = require('../controller/admin/productController');


router.get('/login', adminController.loadAdminLogin);
router.post('/login', adminController.adminLogin);
router.get('/addProduct',  adminController.loadDashboard);
// router.get('/add-product', productController.getProductPage);

module.exports = router;