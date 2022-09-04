const mongoose = require('mongoose');



const cartSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    product : [{ 
        productid :{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'products' 
        },
        quantity :{
            type : Number
        } 
    }]
})

module.exports = mongoose.model('cart',cartSchema)