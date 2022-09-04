const mongoose = require('mongoose');
const { stringify } = require('querystring');



const productSchema = new mongoose.Schema({
    productName:{
        type : String,
    }, 
    price:{
        type : String
    },
    color:{
        type : String
    },
    quantity : {
        type : String
    },
    about: {
        type : String
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category'
    }

})



module.exports = mongoose.model('products',productSchema)