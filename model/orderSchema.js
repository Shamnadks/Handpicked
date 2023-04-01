const mongoose = require('mongoose');
const { ObjectId} = require('mongodb');

const orderSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true
},
product: [
    {
        id: { type: ObjectId },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number },
    }

],
orderId: {
    type: String,
    required: true
},
date: {
    type: Date  ,
    required: true
},
status: { 
    type: String,
    required: true,
    default: "processing"
},
payment_method: {  
    required: true,
    type: String,
},
addressId: {
    type: String,
    required:true
},
subtotal:{
    type:Number,
    required:true
},
total: {
    type: Number,
    default:null
}
})

module.exports = mongoose.model('Order', orderSchema)