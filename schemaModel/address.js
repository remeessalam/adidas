const mongoose = require('mongoose');





const addressScheme = new mongoose.Schema({
    firstName:{
        type : String
    },
    lastName:{
        type : String
    },
    mobileNumber : {
        type : Number
    },
    house : {
        type : String
    },
    street : {
        type : String 
    },
    city  : {
        type : String
    },
    state : {
        type : String
    },
    pincode : {
        type : Number
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    }
});



module.exports = mongoose.model('address',addressScheme)