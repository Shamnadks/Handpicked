require('dotenv').config();
const express = require('express');
const session = require('express-session');
const user_route = express.Router();
const auth = require("../middleware/auth");
const razorPay = require('razorpay');
const instance = new razorPay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET });




user_route.use(session({ secret: process.env.SESSIONSECRET, resave: true, saveUninitialized: true }));

const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const cartController = require("../controllers/cartController");
const checkoutController = require('../controllers/checkoutControllers');
const orderController = require('../controllers/orderController');

user_route.get("/", function (req, res) {
  if (req.session.user || req.session.admin) {
    res.redirect("/home");
  } else {
    res.redirect("/home");
  }
});

user_route.get('/home',auth.isLogin, userController.homeLoad);
user_route.get('/login',auth.isLogout, userController.loginLoad);
user_route.post('/login',auth.isLogout, userController.verifyLogin);

user_route.get('/register',auth.isLogout, userController.registerLoad);
user_route.post('/register',auth.isLogout, userController.sendOtp);
user_route.post('/otp-verify',auth.isLogout, userController.verifyOtp);
user_route.get('/logout',auth.isLogin, auth.isLogout);



user_route.get('/forget', userController.forgetLoad);
user_route.post('/forget', userController.forgetVerify);
user_route.get('/forget-password',userController.forgetPasswordLoad);
user_route.post('/forget-password', userController.resetPassword);



user_route.get('/user-profile', auth.isLogin, userController.userProfile);
user_route.get('/editUserProfile', auth.isLogin, userController.editProfileLoad);
user_route.post('/editUserProfile',auth.isLogin, userController.editProfileUpdate);


user_route.get('/addaddress', auth.isLogin, userController.addAdressLoad);
user_route.post('/addaddress',auth.isLogin, userController.addadressUpload);
user_route.get('/addaddressCheckout',auth.isLogin,userController.addressLoadcheck);
user_route.post('/addaddressCheckout',auth.isLogin,userController.addAddressCheckout);
user_route.get('/editAddress', auth.isLogin, userController.editAddressLoad);
user_route.post('/editAddress', auth.isLogin,userController.editAddressUpdate);
user_route.get('/deleteAddress', auth.isLogin, userController.deleteAdress);


user_route.get('/myOrders',auth.isLogin,orderController.userOrdersLoad);
user_route.get('/singleOrder',auth.isLogin,orderController.singleOrderLoad);
user_route.get('/cancelOrder',auth.isLogin,orderController.cancelOrderLoad);



user_route.get('/shop', productController.shopLoad);
user_route.get('/productView', productController.productViewLoad);
user_route.get('/categorySelection', productController.viewByCategoryLoad);


user_route.get('/cart', auth.isLogin, cartController.cartLoad);
user_route.post('/addToCart', auth.isLogin, cartController.addToCart);
user_route.delete('/removeproduct/:id',auth.isLogin, cartController.removeCartProduct);


user_route.post('/checkout', auth.isLogin, checkoutController.checkOut);
user_route.post('/place-order',auth.isLogin, checkoutController.placeOrder);
user_route.get('/success', auth.isLogin,checkoutController.successorder);
user_route.post('/validateCoupon',auth.isLogin, checkoutController.coupon);


// RAZORPAY

user_route.post('/create/orderId', (req, res) => {
  console.log("Create OrderId Request", req.body)
let  options = {
    amount: req.body.amount,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "rcp1"
  };
  instance.orders.create(options, function (err, order) {
    console.log(order);
    res.send({ orderId: order.id });//EXTRACT5NG ORDER ID AND SENDING IT TO CHECKOUT
  });
});


user_route.post("/api/payment/verify", (req, res) => {

  let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

  let crypto = require("crypto");
  let expectedSignature = crypto.createHmac('sha256', process.env.KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  console.log("sig received ", req.body.response.razorpay_signature);
  console.log("sig generated ", expectedSignature);
  let response = { "signatureIsValid": "false" }
  if (expectedSignature === req.body.response.razorpay_signature)
    response = { "signatureIsValid": "true" }
  res.send(response);
});







module.exports = user_route;