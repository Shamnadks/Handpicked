const dotenv = require("dotenv");
dotenv.config();

const Category = require('../model/categorySchema');



const categoryLoad = async (req,res,next) => {
  try {
    const categoryData = await Category.find({});
    res.render('admin/category', { category: categoryData });

  }
  catch (error) {
    next(error);
  }
}
const addCategoryLoad = async (req, res,next) => {
  try {
    res.render('admin/addNewCategory')

  }
  catch (error) {
    next(error);
  }
}
const categoryUpload = async (req, res,next) => {
  try {
    if (req.body.category !== "") {
      const categoryExist = await Category.find({ category: req.body.category });
      if (categoryExist.length === 0) {
        const categoryData = new Category(req.body);
        await categoryData.save();
        res.redirect("/categoryList");
      }
      else {
        res.render('admin/addNewCategory', { message: "This Category already exists!" })
      }

    }
    else {
      res.render('admin/addNewCategory', { message: "This field can't be Null!" })
    }

  }
  catch (error) {
    next(error);
  }
}
const editCategoryLoad = async (req, res,next) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.findById({ _id: id });
    if (categoryData) {
      res.render('admin/editcategory', { category: categoryData })
    }

    else {
      res.redirect('/categoryList');
    }
  }

  catch (error) {
    next(error);
  }
}

const editCategoryUpload = async (req, res,next) => {
  const categoryExist = await Category.find({ category: req.body.category });
  try {
    if (categoryExist.length === 0) {
      await Category.findByIdAndUpdate({ _id: req.body.id }, { $set: { category: req.body.category } })
      res.redirect('/categoryList');
    }
    else {
      res.render('admin/editCategory', { message: "This Category already exists!", category: categoryExist })
    }
  }
  catch (error) {
    next(error);
  }
}



const deleteCategoryLoad = async (req, res,next) => {
  try {
    const id = req.query.id;
    await Category.deleteOne({ _id: id });
    res.redirect('/categoryList');
  }
  catch (error) {
    next(error);
  }
}

module.exports = {
  categoryLoad,
  addCategoryLoad,
  categoryUpload,
  editCategoryLoad,
  editCategoryUpload,
  deleteCategoryLoad
}