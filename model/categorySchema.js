const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    trim: true,
    uppercase: true
  }
})


module.exports = mongoose.model('category', categorySchema);