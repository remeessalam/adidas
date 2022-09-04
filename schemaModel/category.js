const mongoose = require('mongoose')


const categorySchema = new mongoose.Schema({
    categoryname: {
        type: String,
    }
})



module.exports = mongoose.model('Category', categorySchema)