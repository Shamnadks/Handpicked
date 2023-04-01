
const User = require("../model/userSchema");
const { ObjectId } = require('mongodb');


const cartLoad = async (req, res,next) => {
  try {
    const userData = req.session.userData;
    const cartData = await User.aggregate([
      {
        $match: {
          _id: ObjectId(userData._id),
        },
      },
      {
        $lookup: {
          from: "products",
          let: {
            cartItems: "$cart",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$_id", { $ifNull: ["$$cartItems.productId", []] }],
                },
              },
            },
          ],
          as: "productcartData",
        },
      },
    ]);
    const cartProducts = cartData[0].productcartData;

    let subtotal = 0;
    cartProducts.forEach((cartProduct) => {
      subtotal = subtotal + Number(cartProduct.price);
    });
    const length = cartProducts.length;
    res.render("users/cart", { cartProducts, subtotal, length, userData: req.session.userData });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res) => {
  try {
    const productId = req.body.productId;

    await User.updateOne({ _id: req.session.userData._id }, { $addToSet: { cart: { productId: productId } } });

    res.status(200).json({ message: 'Product added to cart.' });
  } catch (error) {
    next(error);
  }
}

const removeCartProduct = async (req, res) => {
  try {
    await User.findByIdAndUpdate({ _id: req.session.userData._id }, { $pull: { cart: { productId: req.params.id } } });
    res.json("success")
  } catch (error) {
    next(error);
  }
}



module.exports = {
  cartLoad,
  addToCart,
  removeCartProduct,
  

}