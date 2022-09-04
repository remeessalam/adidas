const mongoose = require('mongoose');


const wishlistScheme = new mongoose.Schema({
    userid:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    },
    product : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : 'products'
    }]
});



module.exports = mongoose.model('wishlist',wishlistScheme)