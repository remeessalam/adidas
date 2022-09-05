const mongoose = require('mongoose');
const { stringify } = require('querystring');






const userSchema = new mongoose.Schema({
    fname:{
        type : String,
    },
    lname:{
        type : String
    },
    dateofbirth:{
        type : Date
    },
    gender:{
        type : String
    },
    email:{
        type : String
    },
    password :{
        type : String
    },
    mobilenumber :{
        type : String
    },
    status :{
        type : String,
        default : 'active'
    },
    coupons : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'coupon'
    }],

})



module.exports = mongoose.model('user',userSchema)