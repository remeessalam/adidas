const mongoose = require('mongoose');
const { stringify } = require('querystring');


const adminSchema = new mongoose.Schema({
    username:{
        type : String
    },
    password :{
        type : String
    }
})


module.exports = mongoose.model('adminlogin',adminSchema)