const mongoose = require('mongoose')



const orderSchema = mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    payment : {
        type : String
    },
    totalamount : {
        type : String
    },
    discount : {
        type : String
    },
    address : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'address'
    },
    status : {
        type : String
    },
    products : [{ 
        productid :{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'products' 
        },
        quantity :{
            type : Number
        } 
    }]
 
},{timestamps : true}) 


module.exports = mongoose.model('order',orderSchema)
