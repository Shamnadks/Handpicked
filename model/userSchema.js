const mongoose=require("mongoose");
const { ObjectId } = require("mongodb");

const userSchema= new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true

    },
    mobile:{
        type:String,
        required:true

    },
    password:{
        type:String,
        required:true

    },
    blockStatus:{
        type:Boolean,
    },

    is_admin:{
        type:Number,
        required:true

    },
    
    token : {
        type: String,
        default:''
    },
    address : [{
        houseName: {type: String,required:true },
        houseNumber: {type: Number,},
        street: {type: String,required:true},
        landmark: {type:String,required:true},
        city: {type: String,required:true},
        state: {type: String,required:true},
        pincode : {type: Number,required:true }
     }],
        
        cart : [{
            productId : {
                type : ObjectId
            },
            _id : false
        }],
        wishlist : [{
            productId : {
                type : ObjectId
            },
            _id : false
        }],
        wallet : {
            type: Number,
            default: 0
        }

    },{timestamps:true});
module.exports=mongoose.model('User',userSchema);