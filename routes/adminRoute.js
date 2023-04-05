const express = require('express');
const admin_route = express.Router();

const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/a_categoryController");
const productController = require("../controllers/a_productController");
const orderController = require("../controllers/a_orderController");
const chartController = require("../controllers/a_chartController");
const config = require('../config/config');
const Upload = require('../helper/multer');

const session = require('express-session');
admin_route.use(session({ secret: config.sessionSecret, resave: true, saveUninitialized: true }));

const adminAuth = require('../middleware/adminAuth');

//dashboard
admin_route.get('/admin', adminAuth.isLogout, adminController.loginLoad);
admin_route.post('/admin',adminAuth.isLogout,adminController.verifyLogin);
admin_route.get('/adminhome', adminAuth.isLogin, adminController.homeLoad);
admin_route.get('/adminhome/logout', adminAuth.isLogin, adminController.logout);

//users
admin_route.get('/userlist', adminAuth.isLogin, adminController.userLoad);
admin_route.post('/admin/users/block', adminAuth.isLogin,adminController.userBlock);
admin_route.post('/admin/users/unblock', adminAuth.isLogin,adminController.userUnBlock);

//categories
admin_route.get('/categoryList', adminAuth.isLogin, categoryController.categoryLoad);
admin_route.get('/addcategory', adminAuth.isLogin, categoryController.addCategoryLoad);
admin_route.post('/addcategory',adminAuth.isLogin, categoryController.categoryUpload);
admin_route.get('/categoryedit', adminAuth.isLogin, categoryController.editCategoryLoad);
admin_route.post('/categoryedit', adminAuth.isLogin, categoryController.editCategoryUpload);
admin_route.get('/deleteCategory', adminAuth.isLogin, categoryController.deleteCategoryLoad);

//products
admin_route.get('/productList', adminAuth.isLogin, productController.productLoad);
admin_route.get('/addNewProduct', adminAuth.isLogin, productController.addProductLoad);
admin_route.post('/addNewProduct',adminAuth.isLogin, Upload.array('image'), productController.productUpload);
admin_route.delete('/deleteImage/:imgName',adminAuth.isLogin, productController.removeImage);

admin_route.post('/deleteProduct',adminAuth.isLogin, productController.deleteProduct);
admin_route.get('/productEdit',adminAuth.isLogin, productController.productEdit);
admin_route.post('/productEdit',adminAuth.isLogin, Upload.array('image'), productController.updateProduct);

// coupon
admin_route.get('/coupon', adminAuth.isLogin, adminController.couponLoad);
admin_route.get('/addCoupon', adminAuth.isLogin, adminController.addCouponLoad);
admin_route.post('/addCoupon',adminAuth.isLogin, adminController.newCouponUpdate);

//orders

admin_route.get('/orders', adminAuth.isLogin,  orderController.orderLoad);
admin_route.get('/view_product', adminAuth.isLogin, orderController.viewProductLoad);
admin_route.get('/changeStatus', adminAuth.isLogin, orderController.changeStatusLoad);

//dashboard charts and reports

admin_route.get('/salesGraph', adminAuth.isLogin, chartController.salesGraph);
admin_route.get('/salesReport', adminAuth.isLogin, chartController.salesReport);





module.exports = admin_route;