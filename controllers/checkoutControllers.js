

const User = require("../model/userSchema");
const Product = require("../model/productSchema");
const Order = require("../model/orderSchema");
const Coupon = require("../model/couponSchema");
const { ObjectId } = require('mongodb');
const moment = require('moment');





const checkOut = async (req, res,next) => {
  try {
    const address = await User.find({ _id: req.session.userData._id }).lean();
    const cartData = await User.aggregate([{
      $match: { _id: ObjectId(req.session.userData._id) }
    },
    {
      $lookup: {
        from: "products", let: { cartItems: "$cart" },
        pipeline: [{ $match: { $expr: { $in: ["$_id", "$$cartItems.productId"], }, }, },], as: "Cartproducts",
      },
    },]);
    let subtotal = 0;

    const cartProducts = cartData[0].Cartproducts;
    cartProducts.map((cartProduct, i) => {
      cartProduct.quantity = req.body.quantity[i];
      subtotal = subtotal + cartProduct.price * req.body.quantity[i];
    });
    res.render("users/checkout", {
      productDetails: cartData[0].Cartproducts,
      subtotal: subtotal,
      address: address[0].address,
      userData: req.session.userData._id,
      logged: 1, total: subtotal, offer: 0
    });
  } catch (error) {
    next(error);
  }

}


let couponCode
let couponamount

const placeOrder = async (req, res,next) => {
  try {
    const {
      productid,
      productname,
      price,
      quantity,
      addressId,
      payment,
      subtotal
    } = req.body;
    const result = Math.random().toString(36).substring(2, 7);
    const id = Math.floor(100000 + Math.random() * 900000);
    const orderId = result + id;


    const now = moment()
    const date = now.toDate()

    const productData = productid.map((item, i) => ({
      id: productid[i],
      name: productname[i],
      price: price[i],
      quantity: quantity[i]

    }));

    let total = subtotal;
    if (req.body.coupon) {

      couponCode = req.body.coupon;
      const applied = await Coupon.findOne({ code: req.body.coupon })
      couponamount = applied.percentage
      if (couponamount) {
        const amount = (subtotal * couponamount) / 100
        total = subtotal - amount
      }
    }

    let data = {
      userId: ObjectId(req.session.userData._id),
      product: productData,
      orderId: orderId,
      date: moment().toDate(),
      status: "processing",
      payment_method: String(payment),
      addressId: addressId,
      subtotal: subtotal,
      total: total
    };

    const orderPlacement = await Order.insertMany(data);
    const clearCart = await User.updateOne({ _id: req.session.userData._id }, { $set: { cart: [] } })
    quantity.map(async (item, i) => {
    await Product.updateOne({
        _id: ObjectId(productid[i])
      }, {
        $inc: {
          stock: -Number(item)
        }
      })
    })

    if (orderPlacement && clearCart) {

      req.session.page = 'fghnjm'
      return res.json({
        res: "success",
        data: data
      })
    } else {
      const handlePlacementissue = await Order.deleteMany({
        orderId: orderId,
      });
      res.json("try again")
    }
  }
  catch (error) {
    next(error);
  }
}


const successorder = async (req, res,next) => {
  try {
    
    if (req.session.page) {
      delete req.session.page
      const orderData = await Order.find({}).sort({ _id: -1 }).limit(1)
      res.render('users/successOrder', { order: orderData, userData: req.session.userData._id })
    } else {
      res.redirect('/')
    }

  } catch (error) {
    next(error);
  }
}

let offerPrice
const coupon = async (req, res, next) => {
  try {
    const codeId = req.body.code
    const total = req.body.total
    const couponData = await Coupon.findOne({ code: codeId }).lean();
    const userData = await Coupon.findOne({ code: codeId, userId: req.session.userData._id }).lean()

    if (couponData && couponData.date > moment().format("YYYY-MM-DD")) {
      offerPrice = couponData.offer


      if (userData) {
        res.json("fail")
      } else {
        const amount = total * offerPrice / 100
        const gtotal = total - amount
        res.json({ offerPrice: offerPrice, gtotal: gtotal })
        const userupdate = await Coupon.updateOne({ code: codeId }, { $push: { userId: req.session.userData._id } })
      }
    } else {
      res.json('fail')
    }

  } catch (error) {
    next(error);
  }
}



module.exports={
  checkOut,
  placeOrder,
  successorder,
  coupon 

}
