const mongoose = require('mongoose');


const bannerSchema = new mongoose.Schema({
    heading :{
        type : String
    },
    about : {
        type : String
    },
    product : {
        type : mongoose.Schema.Types.ObjectId,
        ref :'products'
    }

})


module.exports = mongoose.model('banners',bannerSchema)