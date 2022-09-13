const products = require('../schemaModel/products')
const Category = require('../schemaModel/category');
const { json } = require('express');
const coupon = require('../schemaModel/coupon')

module.exports = {
    addProducts: (data) => {
        console.log(data, "hai");
        return new Promise(async (resolve, reject) => {
            if (data) {
                let { productName, price, color, brand, category, quantity, about } = data
                product = new products({
                    productName,
                    price,
                    color, 
                    quantity,
                    about,
                    category
                })
                product.save().then((data) => {
                    console.log('product added')
                    resolve(data)
                })

            } else {
                // resolve(data)
            }
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let allProducts = await products.find().populate('category').lean()
            resolve(allProducts)
        })
    },
    viewproduct: (proId) => {
        return new Promise((resolve, reject) => {
            products.findById(proId).populate('category').lean().then((data) => {
                if (data) {
                    console.log('product found');
                    resolve(data)   
                } else {
                    console.log('product not found'); 
                }
            }).catch((err)=>{
                reject(err)
            }) 
           
        })
    },
    editproduct: (proId, proedit) => {
        return new Promise((resolve, reject) => {
            products.findByIdAndUpdate(proId, proedit).then((data) => {
                if (data) {
                    console.log('product edited');
                    resolve(data)
                } else {
                    console.log('product not edited');
                }
            })
        })

    },
    deleteproduct: (proId) => {
        return new Promise((resolve, reject) => {
            console.log(proId)
            products.findByIdAndDelete(proId).then((response) => {
                console.log('product removed')
                resolve(response)
            })
        })
    },
    addcategory: (body) => {
        let response = {
            duplicate : false
        }
        return new Promise((resolve, reject) => {
            if (body) {
                let categoryname = body.categoryname

                Category.findOne({ categoryname }).then((data) => {
                    if (!data) {
                        categories = new Category({
                            categoryname
                        })
                        categories.save().then((data) => {
                            console.log('category saved')
                            response.duplicate = true
                            response = data
                            resolve(response)
                        }) 
                    } else {
                        response = data
                        resolve(response)

                    } 
                })

            }
        })
    },
    getcategory: () => {
        return new Promise(async (resolve, reject) => {
            let categoryname = await Category.find().lean()
            resolve(categoryname)
        })
    },
    getCategoryProds: (id) => {
        console.log(id)

        return new Promise((resolve, reject) => {
            products.find({ category: id }).lean().then((data) => {
                console.log(JSON.stringify(data) + "--------------------------------")
                resolve(data)
            }).catch((err)=>{
                reject (err)
            })
        })
    }, 
    getonecategory: (catid) => {
        return new Promise(async (resolve, reject) => {
            Category.findById(catid).lean().then((categoryname)=>{
                resolve(categoryname)
            }).catch((err)=>{
                reject(err)
            })
           
        })
    },
    addcoupon: (coupondetails) => {
        return new Promise((resolve, reject) => {
            addCoupon = new coupon({
                couponCode: coupondetails.couponCode,
                discription: coupondetails.discription,
                discount: coupondetails.discount
            })
            addCoupon.save().then((data) => {
                console.log('coupon added')
                resolve (data)
            })
        })
    },
    getcoupon: () => {
        return new Promise((resolve, reject) => {
            coupon.find().lean().then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    deletecoupon : (id)=>{
        return new Promise((resolve, reject) => {
            coupon.findByIdAndDelete(id).then((data)=>{
                console.log('deleted coupon')
                resolve(data)
            })
        })
    }
}