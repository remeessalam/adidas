const { resolve } = require("path")
const { response } = require("../app")
const userschema = require("../schemaModel/userschema")
const order = require('../schemaModel/order')
const { populate } = require("../schemaModel/products")



module.exports = {
    getAllUserDetails: () => {
        return new Promise(async (resolve, reject) => {
            let allUser = await userschema.find().lean()
            // console.log(allUser);
            resolve(allUser)
        })

    }, blockuser: (userId) => {
        return new Promise((resolve, reject) => {
            userschema.findOneAndUpdate({ _id: userId }, { $set: { status: 'blocked' } }).then((response) => {
                console.log('user blocked')
                resolve(response)
            })
        })
    },
    unblockuser: (userId) => {
        return new Promise((resolve, reject) => {
            userschema.findOneAndUpdate({ _id: userId }, { $set: { status: 'active' } }).then((response) => {
                console.log('user active')
                resolve(response)
            })
        })
    }, userview: (userId) => {
        return new Promise((resolve, reject) => {
            console.log(userId + 'hai')
            userschema.findById(userId).lean().then((response) => {
                if (response) {
                    console.log(response + 'find user')
                    resolve(response)
                }

            })
        })
    }, edituser: (userid,edited) => {
        return new Promise((resolve, reject) => {
            let { fname, lname, gender, dateofbirth, mobilenumber } = edited
            userschema.findByIdAndUpdate(userid, {
                fname, lname, gender, dateofbirth,  mobilenumber
            }).then((response) => {
                if (response) {
                    console.log('edited user')
                    resolve(response)
                }
            })
        })
    },
    getorders: () => {
        return new Promise((resolve, reject) => {
            order.find().populate('user').populate('products.productid').populate('address').lean().then((response) => {
                resolve(response)
            })
        })
    },
    viewOrder: (orderid) => {
        return new Promise((resolve, reject) => {
            order.findById(orderid).populate('user').populate('products.productid').populate('address').lean().then((response) => {
                resolve(response)
            })
        })
    },
    changestatus: (orderid, status) => {
        return new Promise((resolve, reject) => {
            order.findOneAndUpdate({ _id: orderid }, { $set: { status: status } }).then((response) => {
                resolve(response)
            })
        })
    }

}    