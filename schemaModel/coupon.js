const mongoose = require('mongoose')



const couponSchema = new mongoose.Schema({
    couponCode : {
        type : String
    },
    discription : {
        type : String
    },
    discount : {
        type : Number
    }
})


module.exports = mongoose.model('coupon',couponSchema)