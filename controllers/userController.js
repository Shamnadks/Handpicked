require('dotenv').config();
const User = require("../model/userSchema");
const Product = require("../model/productSchema");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const random = require('randomstring');


const securePassword = async (password,next) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  }
  catch (error) {
    next(error);
  }
}


function generateOTP() {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}
const sendVerifyMail = async (email,next) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMIALUSER,
        pass: process.env.EMAILPASSWORD
      }
    });
    const mailOptions = {
      from: process.env.EMIALUSER,
      to: email,
      subject: 'OTP for authentication',
      text: `Your OTP is ${saavedOtp}`
    }
    transporter.sendMail(mailOptions, function (error, info,next) {
      if (error) {
        next(error);
      }
    
    });
  }

  catch (error) {
    next(error);
  }
}

//for forget password reset link

const sendResetLink = async (name, email, token,next) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMIALUSER,
        pass: process.env.EMAILPASSWORD,
      }
    });
    const mailOptions = {
      from: process.env.EMIALUSER,
      to: email,
      subject: 'forget password link',
      html: '<p>Hii ' + name + ', please click here to <a href="http://127.0.0.1:3000/forget-password?token=' + token + '">Reset your Password</a></p>'
    }
    transporter.sendMail(mailOptions, function (error, info,next) {
      if (error) {
        next(error);
      }
    
    });
  }

  catch (error) {
    next(error);
  }
}



const homeLoad = async (req, res,next) => {
  try {
    const productData = await Product.find({ is_deleted: false });
    if (req.session.user) {
      const userData = req.session.userData;
      User.findOne({ _id: userData._id }).then((user) => {
        res.render("users/index", { userData: userData, product: productData });
      })
    } else {
      res.render("users/index", { product: productData });
    }
  } catch (error) {
    next(error);
    res.status(500).send("Internal server error");
  }
};

const loginLoad = async (req, res,next) => {
  try {
    if (req.session.user) {
      res.redirect('/home')
    }
    else {
      res.render('users/login');
    }
  }
  catch (error) {
    next(error);
  }
}

const registerLoad = async (req, res,next) => {
  try {
    res.render('users/registration');

  }
  catch (error) {
    next(error);
  }
}




let saavedOtp;
let naame;
let emaail;
let moobile;
let paassword;

const sendOtp = async (req, res,next) => {
  try {
    let otp = generateOTP();
    saavedOtp = otp;
    naame = req.body.name;
    emaail = req.body.email;
    moobile = req.body.mno;
    paassword = req.body.password;
    let email = await User.findOne({ email: req.body.email })
    if (!email) {
      sendVerifyMail(req.body.email);
      res.render("users/otp");
    } else {
      res.render("users/registration", { message: "This email  is already registered." })
    }
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res) => {
  const otp = req.body.otp;
  if (otp === saavedOtp) {
    const password = await securePassword(paassword);
    const user = new User({
      name: naame,
      email: emaail,
      mobile: moobile,
      password: password,
      blockStatus: false,

      is_admin: 0
    });

    const userData = user.save();
    
    if (userData) {
      res.render('users/registration', { message: "Your registration has been successful,Please continue to Login." })
    }
    else {
      res.render('users/registration', { message: "Your registration has been failed" })
    }


  } else {

    res.render("users/otp", { error: "Invalid OTP" });
  }
};

const verifyLogin = async (req, res,next) => {
  try {


    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email: email });

    if (user) {

      //decrypting the password 

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {

        if (user.blockStatus) {
          res.render('users/login', { message: "YOUR ACCOUNT HAS BEEN BLOCKED BY THE ADMIN" });
        }
        else {

          req.session.userData = user
          req.session.user = true;
          res.redirect('/home');
        }
      }

      else {
        res.render('users/login', { message: "Incorrect Email and  Password" });
      }
    }


    else {
      res.render('users/login', { message: "Incorrect Email and Password" });
    }
  }
  catch (error) {
    req.session.user = false;
    next(error);
  }

}


//forget password

const forgetLoad = async (req, res,next) => {
  try {
    res.render('users/forget');
  }
  catch (error) {
    next(error);
  }
}

const forgetVerify = async (req, res,next) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      let randomString = random.generate();

      const updateData = await User.updateOne({ email: email }, { $set: { token: randomString } });
      sendResetLink(userData.name, userData.email, randomString);
      res.render('users/forget', { message: "Please check your mail to reset your password" });

    }
    else {
      res.render('users/forget', { message: "Incorrect Email" });
    }
  }
  catch (error) {
    next(error);
  }
}


const forgetPasswordLoad = async (req, res,next) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      res.render('users/forget-password', { user_id: tokenData._id });
    }
    else {
      res.render('404', { message: "Token is invalid!!!!Please try again!!!" });
    }
  }
  catch (error) {
    next(error);
  }
}

const resetPassword = async (req, res,next) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;
    const secure_password = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } });
    res.redirect('/login');
  }
  catch (error) {
    next(error);
  }
}
const userProfile = async (req, res,next) => {
  try {
    const userData = await User.findById({ _id: req.session.userData._id })
    res.render('users/userprofile', { userData: userData, address: userData.address });
    }
  catch (error) {
    next(error);
  }
}



const editProfileLoad = async (req, res,next) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render('users/edit-profile', { userData: userData });
    }
    else {
      res.redirect('/home');
    }

  }
  catch (error) {
    next(error);
  }
}
const editProfileUpdate = async (req, res,next) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: name, email: email, mobile: mobile } });
    res.redirect('/user-profile');
  }
  catch (error) {
    next(error);
  }
}
const addAdressLoad = async (req, res,next) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render('users/add-address', { userData: userData });
    }
    else {
      res.redirect('/home');
    }


  }
  catch (error) {
    next(error);
  }
}



const addadressUpload = async (req, res,next) => {
  try {
    const id = req.query.id;
    const newAddress = {
      houseName: req.body.houseName,
      houseNumber: req.body.houseNumber,
      street: req.body.street,
      landmark: req.body.landmark,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode

    };

    const userData = await User.findByIdAndUpdate({ _id: id }, { $push: { address: newAddress } }, { new: true }).exec();

    res.redirect('/user-profile');
    }
    catch (error) {
    next(error);
  }
}

const addressLoadcheck = async (req, res,next) => {
  try {
    res.render('users/add-address2', { userData: req.session.userData._id });
  }
  catch (error) {
    next(error);
  }
}

const addAddressCheckout = async (req, res,next) => {
  try {
    const userData = req.session.userData
    const address = await User.findByIdAndUpdate({ _id: userData._id }, { $addToSet: { address: req.body } });
    res.redirect('/cart');
  } catch (error) {
    next(error);
  }
}

const editAddressLoad = async (req, res,next) => {
  try {
    const id = req.query.id;
    const userData = req.session.userData;
    const userAddress = await User.findOne({ address: { $elemMatch: { _id: id } } }, { "address.$": 1, _id: 0 });
    res.render('users/edit-address', { address: userAddress, userData: userData });

  }
  catch (error) {
    next(error);
  }
}

const editAddressUpdate = async (req, res,next) => {
  try {

    const id = req.query.id;
    const userAddress = await User.updateOne(
      { address: { $elemMatch: { _id: id } } }, { $set: { "address.$": req.body } });
    res.redirect('/user-profile');

  }
  catch (error) {
    next(error);
  }
}

const deleteAdress = async (req, res,next) => {
  try {
    const id = req.query.id;
    const userData = await User.findByIdAndUpdate({ _id: req.session.userData._id }, { $pull: { address: { _id: id } } });
    res.redirect('/user-profile');
  }
  catch (error) {
    next(error);
  }
}

module.exports = {
  homeLoad,
  loginLoad,
  registerLoad,
  sendOtp,
  verifyOtp,
  verifyLogin,
  forgetLoad,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword,
  userProfile,
  editProfileLoad,
  editProfileUpdate,
  addAdressLoad,
  addadressUpload,
  addressLoadcheck,
  addAddressCheckout,
  editAddressLoad,
  editAddressUpdate,
  deleteAdress
}
  


