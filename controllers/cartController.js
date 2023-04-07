
const User = require("../model/userSchema");
const { ObjectId } = require('mongodb');


const cartLoad = async (req, res,next) => {
  try {
    const user = await User.findById(req.session.userData);
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
      
     cartProducts.forEach((cartProduct) => {
      const cartItem = user.cart.find((item) => item.productId.equals(cartProduct._id));
      cartProduct.quantity = cartItem ? cartItem.quantity : 1;
    });
    
    let subtotal = 0;
    cartProducts.forEach((cartProduct) => {
      subtotal = subtotal + Number(cartProduct.price);
    });
    const length = cartProducts.length;
    res.render("users/cart", { cartProducts, subtotal, length, userData: req.session.userData ,user});
  } catch (error) {
    next(error);
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const productId = req.params.productId;
    const newQuantity = req.body.quantity;

    const user = await User.findById(req.session.userData);
    const cartItem = user.cart.find(item => item.productId.toString() === productId.toString());

    if (cartItem) {
      cartItem.quantity = newQuantity;
    }

    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
  updateCartQuantity
  

}
