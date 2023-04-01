const mongoose=require("mongoose");
const { ObjectId } = require("mongodb");



const productSchema= new mongoose.Schema({
  
    productName:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true

    },
    description:{
        type:String,
        required:true

    },
    stock:{
        type:Number,
        required:true

    },
    images:{
        type:Array,
        required:true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
      },
      
   is_deleted : {
    type:Boolean,
    
   } 


 });
module.exports=mongoose.model('product', productSchema);