const User = require("../model/userSchema");
const Product = require("../model/productSchema");
const Order = require("../model/orderSchema");

const userOrdersLoad = async (req, res,next) => {
  try {
    const orderData = await Order.find({ userId: req.session.userData._id }).sort({ _id: -1 })
    res.render('users/myOrderPage', { order: orderData, userData: req.session.userData._id })
  }
  catch (error) {
    next(error);

  }
}

const singleOrderLoad = async (req, res,next) => {
  try {
    const orderData = await Order.find({ orderId: req.query.id }).lean();
    res.render('users/singleOrder', { order: orderData, userData: req.session.userData.name })
  }
  catch (error) {
    next(error);
  }
}

const cancelOrderLoad = async (req, res,next) => {
  try {

    const id = req.query.id;
    const orderData = await Order.findById({ _id: id }).lean();
    const pID = orderData.product;
    pID.forEach(async (elem, i) => {
      const reduceStock = await Product.updateOne({ _id: elem.id }, {
        $inc: {
          quantity: +elem.quantity
        }
      })
    })
    
    await User.updateOne(
      { _id: req.session.userData._id },
      { $inc: { wallet: orderData.total } }
    );
    if (orderData.status === "Delivered") {
      await Order.findOneAndUpdate({ _id: id }, {

        $set: {
          status: "Returned"

        }

      })
    } else if (orderData.status === "processing") {
      await Order.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            status: "Cancelled",
          },
        }
      );

    }
    else if (orderData.status === "Shipped") {
      await Order.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            status: "Cancelled",
          },
        }
      );

    }
    res.redirect('/myOrders');
  } catch (error) {
     next(error);
  }
}


module.exports={
  userOrdersLoad,
  singleOrderLoad,
  cancelOrderLoad


}