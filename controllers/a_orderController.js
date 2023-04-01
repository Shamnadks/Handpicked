const dotenv = require("dotenv");
dotenv.config();
const { ObjectId } = require('mongodb');

const Order = require('../model/orderSchema');


const orderLoad = async (req, res,next) => {
  try {
    const orderData = await Order.find({}).sort({ _id: -1 });
    res.render('admin/orders', { order: orderData });
  }
  catch (error) {
    next(error);
  }
}

const viewProductLoad = async (req, res,next) => {
  try {

    const orderData = await Order.find({ _id: ObjectId(req.query.id) });
    res.render('admin/productView', { order: orderData });

  }
  catch (error) {
    next(error);
  }
}
const changeStatusLoad = async (req, res,next) => {
  try {
    const id = req.query.id;
    const orderData = await Order.findOne({ _id: id });
    if (orderData.status === "processing") {
      await Order.findOneAndUpdate({ _id: id }, { $set: { status: "Shipped" } });
    }
    if (orderData.status === "Shipped") {
      await Order.findOneAndUpdate({ _id: id }, { $set: { status: "Out for Delivery" } });
    }
    if (orderData.status === "Out for Delivery") {
      await Order.findOneAndUpdate({ _id: id }, { $set: { status: "Delivered" } });
    }
    res.redirect('/orders');

  }
  catch (error) {
    next(error);
  }
}


module.exports = {
  orderLoad,
  viewProductLoad,
  changeStatusLoad
}
