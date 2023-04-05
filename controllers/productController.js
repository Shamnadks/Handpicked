require('dotenv').config();
const Product = require("../model/productSchema");
const Category = require("../model/categorySchema");

const shopLoad = async (req, res, next) => {
  try {


    let search = '';
    if (req.query.search) {
      search = req.query.search;
    }
    let page = 1;
    if (req.query.page) {
      page = parseInt(req.query.page);
    }
    const limit = 8;

    const categoryData = await Category.find({});
    const productData = await Product.find({
      is_deleted: false,
      $or: [{ productName: { $regex: '.*' + search + '.*', $options: 'i' } }],
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const count = await Product.find({

      $or: [{ productName: { $regex: '.*' + search + '.*', $options: 'i' } }],
    }).countDocuments();

    const totalPages = Math.ceil(count / limit);

    res.render('users/shop', {
      category: categoryData,
      product: productData,
      userData: req.session.userData,
      totalPages: totalPages,
      currentPage: page,
      previous: page - 1,
      nextone: page + 1
    });
  } catch (error) {
    next(error);
  }
};

const productViewLoad = async (req, res, next) => {
  try {
    const id = req.query.id;
    const name = req.query.name;
    const productData = await Product.findOne({ $or: [{ _id: id }, { productName: name }] });
    res.render('users/product-single', { product: productData, userData: req.session.userData });
  }
  catch (error) {
    next(error);
  }
}

const viewByCategoryLoad = async (req, res, next) => {
  try {
    const categoryData = await Category.findById({ _id: req.query.id });
    const productData = await Product.find({ category: req.query.id, is_deleted: false });
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