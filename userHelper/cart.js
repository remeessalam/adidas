const banner = require('../schemaModel/banner')
const cart = require('../schemaModel/cart')
const address = require('../schemaModel/address')
const { findOneAndDelete } = require('../schemaModel/banner')
const order = require('../schemaModel/order')
const coupon = require('../schemaModel/coupon')
const Razorpay = require('razorpay')
const user = require('../schemaModel/userschema')
const { response } = require('../app')
const { resolve } = require('path')
const { ifError } = require('assert')
const wishlist = require('../schemaModel/wishlist')
const env = require('dotenv').config()
var instance = new Razorpay({ 
    key_id: process.env.key_id,
    key_secret : process.env.key_secret
});

const obj = {
    addtocart: (userId, proId) => {
        let response = {
            duplicate: false
        }

        return new Promise(async (resolve, reject) => {
            let carts = await cart.findOne({ user: userId }).populate('product.productid')
            if (carts) {
                console.log('hai')
                let cartproduct = await cart.findOne({ user: userId, 'product.productid': proId }).populate('product.productid')
                console.log(cartproduct + 'in first cart if')
                if (cartproduct) {
                    console.log('if in cartproduct ' + cartproduct)
                    response.duplicate = true
                    resolve(response)
                } else {
                    console.log('in else in cart product not in array')
                    let cartArray = { productid: proId, quantity: 1 }
                    cart.findOneAndUpdate({ user: userId }, { $push: { product: cartArray } }).then((data) => {
                        console.log(data + 'cart updated')
                        resolve(response)
                    })
                } 
            } 
            else {
                let user = userId
                let productid = proId
                let quantity = 1
                console.log(productid)
                carts = new cart({
                    user,
                    product: [{ productid, quantity }]

                })
                carts.save().then((response) => {
                    console.log(response)
                    resolve(response)
                })
            }
        })
    },
    getcart: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId)
            let carts = await cart.findOne({ user: userId }).populate('product.productid').lean()
            if (carts) {

                console.log(carts + "getcart if in")

                //   console.log ( cartproduct)
                resolve(carts)
            } else {
                console.log(carts + 'cart not found')
                resolve(carts)
            }
        })
    },
    deletecart: (cartid) => {
        return new Promise((resolve, reject) => {
            cart.findByIdAndDelete(cartid).then((data) => {
                resolve(data)
            })
        })
    },
    inccart: (prodid, userid) => {
        return new Promise(async (resolve, reject) => {
            let cartitems = await cart.updateOne({ user: userid, 'product.productid': prodid }, { $inc: { 'product.$.quantity': 1 } })
            if (cartitems) {
                resolve(cartitems)
            }
        })
    },
    mincart: (prodid, userid) => {
        return new Promise(async (resolve, reject) => {
            let cartitems = await cart.updateOne({ user: userid, 'product.productid': prodid }, { $inc: { 'product.$.quantity': -1 } })
            if (cartitems) {
                resolve(cartitems)
            }
        })
    },
    deletecartproduct: (proid, userid) => {
        return new Promise(async (resolve, reject) => {
            let cartitems = await cart.updateOne({ user: userid, 'product.productid': proid }, { $pull: { product: { productid: proid } } }).then((data) => {
                console.log('cartdeleted')
            })
        })
    },
    addWishList: (prodid, userId) => {
        let response = {
            duplicate: false
        }
        return new Promise(async (resolve, reject) => {
            let list = await wishlist.findOne({ userid: userId })
            if (list) {
                console.log('hai---------')
                let listproduct = await wishlist.findOne({ user: userId, product: prodid })
                console.log(listproduct + 'in first cart if')
                if (listproduct) {
                    console.log('if in cartproduct ' + listproduct)
                    response.duplicate = true
                    resolve(response)
                } else {
                    console.log('in else in cart product not in array')
   
                    wishlist.findOneAndUpdate({ userid: userId }, { $push: {product: prodid } }).then((data) => {
                        console.log(data + 'cart updated')
                        resolve(response)
                    })
                }
            }
            else {
                let userid = userId
                let items = prodid
                console.log(items)
                wishlists = new wishlist({
                    userid,
                    product:items

                })
                wishlists.save().then((data) => {
                    console.log(data + "-------------------------")
                    resolve(response)
                })
            }
        })
    },
    getwishlist: (id) => {
        return new Promise((resolve, reject) => {
            wishlist.findOne({ userid: id }).populate('product').lean().then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },
    deletefavorite: (prodid, user) => {
        return new Promise((resolve, reject) => {
            console.log(prodid, user)
            wishlist.updateOne({ userid: user, product: prodid }, { $pull: { product: prodid  } }).then((response) => {
                console.log(response)
                resolve(response)
            })
        })
    },
    gettotalamount: (userid, discount) => {
        console.log(discount)
        return new Promise(async (resolve, reject) => {
            let cart = await obj.getcart(userid)


            if (cart && cart.product.length > 0) {
                let total = cart.product.reduce((acc, curr) => {
                    acc += curr.productid.price * curr.quantity
                    return acc
                }, 0)
                if (discount > 0) {
                    console.log(total)
                    totalprice = total * discount / 100
                    total = total - totalprice
                    resolve(total)
                } else {
                    resolve(total)
                }

            }
        })
    },
    addAddress: (add, userid) => {
        return new Promise((resolve, reject) => {
            addDetails = new address({
                firstName: add.firstName,
                lastName: add.lastName,
                mobileNumber: add.mobileNumber,
                house: add.house,
                street: add.street,
                city: add.city,
                state: add.state,
                pincode: add.pincode,
                user: userid

            })
            addDetails.save().then((data) => {
                resolve(data)

            })
        })
    },
    getAddress: (id) => {
        return new Promise((resolve, reject) => {
            address.find({ user: id }).lean().then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    },
    deleteAddress: (addressid) => {
        return new Promise((resolve, reject) => {
            address.findByIdAndDelete(addressid).then((data) => {
                console.log('from carthelper address deleted')
                resolve(data)
            })
        })
    },
    addorder: (orderdetails, userid) => {
        console.log(orderdetails)
        return new Promise(async (resolve, reject) => {
            let products = await cart.findById(orderdetails.cartid).lean()
            console.log("----------------", JSON.stringify(products) + "addddddddddd")
            let status = orderdetails.payment === 'cod' ? 'placed' : 'pending'
            orders = new order({
                user: userid,
                payment: orderdetails.payment,
                totalamount: orderdetails.totalamount,
                discount: orderdetails.discount,
                address: orderdetails.address,
                status: status,
                products: products.product
            })
            orders.save().then((order) => {

                obj.deletecart(orderdetails.cartid).then((response) => {
                    resolve(order)
                })
            })
        })
    },
    getorders: (orderid) => {
        console.log(orderid + "sjfhkjsafhgksafhgsafhgiashgsghskjghkjghkajsfg")
        return new Promise((resolve, reject) => {
            order.findById(orderid).populate('products.productid').populate('address').lean().then((data) => {
                console.log('order founded' + data)
                resolve(data)
            })
        })
    },
    getallorder: (id) => {
        console.log(id+"------")
        return new Promise((resolve, reject) => {
            order.find({ user:id }).populate('products.productid').populate('address').lean().then((data) => {
                console.log('fount all products' + data)
                resolve(data)
            })
        })
    },
    getcoupon: (id) => {
        coupon.findById(id).lean().then((data) => {
            console.log(data)
            resolve(data)
        })
    },
    checkcoupon: (coupons, userid) => {
        return new Promise(async (resolve, reject) => {
            console.log(coupons)

            coupon.findOne({ couponCode: coupons.coupon }).then(async (data) => {
                console.log(data)
                if (data) {
                    let users = await user.findOne({ _id: userid, coupons: data._id })
                    console.log(users, "--------------------------------------------------------")
                    if (users) {
                        console.log('coupon used')
                        let response = { status: false }
                        resolve(response)
                    } else {
                        user.findByIdAndUpdate(userid, { $push: { coupons: data._id } }).then((cadd) => {
                            console.log(cadd)
                            console.log('new couppon assddddddd')
                            let response = { data, status: true }
                            resolve(response)
                        })

                    }
                } else {
                    let response = { status: false }
                    resolve(response)
                }

            })
        })
    },
    generateRazorpay: (ordered) => {
        return new Promise((resolve, reject) => {
            console.log(ordered)
            var options = {
                amount: parseInt(ordered.totalamount) * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + ordered._id
            };
            instance.orders.create(options, function (err, order) {
                console.log("new order id" + JSON.stringify(order));
                resolve(order)
            });
        })
    },
    verifypayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'UeLXqy5eD9fWYNBISLGrJZLR')
            hmac.update(details.response.razorpay_order_id + '|' + details.response.razorpay_payment_id)
            hmac = hmac.digest('hex')
            console.log(details.response.razorpay_signature, '------', hmac)
            if (hmac === details.response.razorpay_signature) {
                resolve()
            } else {
                console.log('hmac rejected')
                reject()
            }
        })
    },
    changepaymentstatus: (orderid) => {
        return new Promise((resolve, reject) => {
            console.log(orderid)
            order.findByIdAndUpdate(orderid, { $set: { status: 'placed' } }).then((data) => {
                console.log(data)
                resolve(data)
            })
        })
    }, viewOrderDetails: (orderid) => {
        return new Promise((resolve, reject) => {
            order.findById(orderid).populate('user').populate('address').populate('products.productid').lean().then((response) => {
                resolve(response)
            })
        })
    }
}

module.exports = obj


// addToCart: (userId, proId) => {
//     let user_Id = mongoose.Types.ObjectId(userId);
//     const response = {
//       duplicate: false,
//     };
//     return new Promise(async (resolve, reject) => {
//       let cart = await cartModel.findOne({ user: user_Id });
//       if (cart) {
//         let cartProduct = await cartModel.findOne({
//           user: user_Id,
//           "cartItems.product": proId,
//         });
//         if (cartProduct) {
//           response.duplicate = true;
//           resolve(response);
//         } else {
//           let cartArray = { product: proId, quantity: 1 };
//           cartModel
//             .findOneAndUpdate(
//               { user: user_Id },
//               { $push: { cartItems: cartArray } }
//             )
//             .then(async (data) => {
//               let wishList = await wishListModel.findOne({
//                 user: user_Id,
//                 "wishListItems.product": proId,
//               });
//               if (wishList) {
//                 wishListModel
//                   .updateOne(
//                     { user: userId },
//                     {
//                       $pull: {
//                         wishListItems: { product: proId },
//                       },
//                     }
//                   )
//                   .then((data) => {
//                     response.added = false;
//                     response.data = data;
//                     resolve(response);
//                   });
//               }
//               resolve(data);
//             });
//         }
//       } else {
//         let product = proId;
//         let quantity = 1;
//         cart = new cartModel({
//           user: userId,
//           cartItems: [
//             {
//               product,
//               quantity,
//             },
//           ],
//         });
//         cart.save().then(async (data) => {
//           let wishList = await wishListModel.findOne({
//             user: user_Id,
//             "wishListItems.product": proId,
//           });
//           if (wishList) {
//             wishListModel
//               .updateOne(
//                 { user: userId },
//                 {
//                   $pull: {
//                     wishListItems: { product: proId },
//                   },
//                 }
//               )
//               .then((data) => {
//                 response.added = false;
//                 response.data = data;
//                 resolve(response);
//               });
//           }
//           resolve(data);
//         });
//       }
//     });
//   },