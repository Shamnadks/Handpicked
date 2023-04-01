
require('dotenv').config();
const Product = require("../model/productSchema");
const Category = require("../model/categorySchema");


const shopLoad = async (req, res,next) => {
  try {
    const search = '';
    if (req.query.search) {
      search = req.query.search;
    }
    const categoryData = await Category.find({})
    const productData = await Product.find({
      is_deleted: false, $or: [
        { productName: { $regex: '.*' + search + '.*', $options: 'i' } },
      ]
    })

    res.render('users/shop', { category: categoryData, product: productData, userData: req.session.userData });
   

  }
  catch (error) {
    next(error);
  }
}


const productViewLoad = async (req, res,next) => {
  try {
    const id = req.query.id;
    const name = req.query.name;
    const productData = await Product.findOne({ $or: [{ _id: id }, { productName: name }] });
    res.render('users/product-single', { product: productData ,userData: req.session.userData});
  }
  catch (error) {
    next(error);
  }
}



const viewByCategoryLoad = async (req, res,next) => {
  try {
    const categoryData = await Category.findById({ _id: req.query.id });
    const productData = await Product.find({ category: req.query.id, is_deleed: false });
    res.render('users/category-view', { product: productData, category: categoryData });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  shopLoad,
  productViewLoad,
  viewByCategoryLoad


}