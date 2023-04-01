const dotenv = require("dotenv");
dotenv.config();

const User = require("../model/userSchema");
const Coupon = require('../model/couponSchema');
const Order = require('../model/orderSchema');




const admin_mail = process.env.ADMINEMAIL;
const admin_password = process.env.ADMINPASSWORD;


const loginLoad = async (req, res,next) => {
  try {
    res.render('admin/signin');
  }
  catch (error) {
    next(error);
  }
}

const verifyLogin = async (req, res,next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = {
      adminmail: admin_mail,
      adminpass: admin_password
    }

    if (email === adminData.adminmail && password === adminData.adminpass) {
      req.session.admin = adminData;
      res.redirect('/adminhome');
    }
    else {
      res.render('admin/signin', { message: "Email and Password Incorrect" });
    }

  }
  catch (error) {
    next(error);
  }
}

const homeLoad = async (req, res,next) => {
  try {
    const orderData = await Order.find({}).sort({ _id: -1 });
     res.render('admin/dashboard', { order: orderData });
  
  }
  catch (error) {
    next(error);
  }
}
const logout = async (req, res,next) => {
  try {
    req.session.admin = false;
    res.redirect('/admin');

  }
  catch (error) {
    next(error);
  }
}

const userLoad = async (req, res,next) => {
  try {
    let search = '';
    
    if (req.query.search) {
      search = req.query.search;
    }
    
    const userData = await User.find({
      $or: [
        { name: { $regex: '.*' + search + '.*', $options: 'i' } },
        { email: { $regex: '.*' + search + '.*', $options: 'i' } },
        { mobile: { $regex: '.*' + search + '.*', $options: 'i' } },
      ]
    });

    res.render('admin/userList', { users: userData });

  }
  catch (error) {
    next(error);
  }
}
const userBlock = async (req, res,next) => {
  try {
    const id = req.body.id;
    req.session.adminMessage = "";
    const response = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { blockStatus: true } }
    );
    req.session.userData = false;
    req.session.user = false;
    const message = "User Blocked Successfully";
    req.session.adminMessage = message;
    res.json(response);
    res.redirect("/admin/userslist");
  } catch (error) {
    next(error);
  }
};


const userUnBlock = (req, res,next) => {
  const id = req.body.id;
  req.session.adminMessage = "";
  User.findOneAndUpdate({ _id: id }, { $set: { blockStatus: false } })
    .then((response) => {
      const message = "User unBlocked Successfully";
      req.session.adminMessage = message;
      res.json(response);
      res.redirect("/admin/userslist");
    })
    .catch((error) => {
      next(error);
    });
};


const couponLoad = async (req, res,next) => {
  try {
    const couponData = await Coupon.find();
    res.render('admin/coupon', { coupons: couponData });
  }
  catch (error) {
    next(error);
  }
}

const addCouponLoad = async (req, res,next) => {
  try {
    res.render('admin/addNewCoupon');
  }
  catch (error) {
    next(error);
  }
}

const newCouponUpdate = async (req, res,next) => {
  try {

    const coupon = new Coupon({
      code: req.body.code,
      date: req.body.date,
      offer: req.body.percent
    })

    const couponData = await coupon.save();
    if (couponData) {
      res.redirect('/coupon');

    }
    else {
      res.redirect('/addCoupon');
    }

  }
  catch (error) {
    next(error);
  }
}

module.exports = {
  loginLoad,
  verifyLogin,
  homeLoad,
  logout,
  userLoad,
  userBlock,
  userUnBlock,
  couponLoad,
  addCouponLoad,
  newCouponUpdate
}
