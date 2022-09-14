var express = require('express');
const { request } = require('http');
var router = express.Router();
const credentialCheck = require('../credentialCheck/userCheck')
const productdetails = require('../adminHelpers/productHelper')
const userHelper = require('../adminHelpers/userHelper')
const cart = require('../userHelper/cart')
const banner = require('../adminHelpers/bannerHelpers');
const { response } = require('../app');
const { stringify } = require('querystring');
const { ifError } = require('assert');
const coupon = require('../schemaModel/coupon');
const { nextTick } = require('process');
/* HOME PAGE RENDERING */
const verifylogin = async (req, res, next) => {
  if (req.session.login) {
    let users = req.session.users
    console.log(users,'user')
    let status = await userHelper.userview(users._id)
    if (status.status === 'active') {
      req.session.login = true
      next()
    } else {
      let msg = 'YOU ARE BLOCKED...!'
      req.session.login = false
      res.render('user/login', { msg })
    }
  } else {
    res.redirect('/login')
  }
}
router.get('/', function (req, res, next) {
  try {

    let users = req.session.users
    console.log(users)
    productdetails.getAllProducts().then(async (data) => {
      let banners = await banner.getbanner()
      console.log(banners)
      let categories = await productdetails.getcategory()
      res.render('index', { banners, categories, data, users, user: true });
      console.log(banners)

    })
  } catch (err) {
    next(err)
  }
});
/* GET SIGNUP PAGE*/
router.get('/userSignup', (req, res, next) => {
  try {
    if (req.session.founded) {

      let msg = "THIS EMAIL IS ALREADY REGISTERED"
      res.render('user/userSignup', { msg })
    }

    res.render('user/userSignup')
  } catch (err) {
    next(err)
  }
})
/* POST SIGNUP PAGE */
router.post('/signup', (req, res, next) => {
  try {
    req.session.users = req.body
    let user = req.body
    credentialCheck.dosignUp(user).then((data) => {
      if (!data.founded) {
        req.session.signup = true
        req.session.login = true
        req.session.users = data
        res.redirect('/')
      } else {
        req.session.founded = true
        res.redirect('/userSignup')
      }

    })
  } catch (err) {
    next(err)
  }
})
/* GET LOGIN PAGE */
router.get('/login', async (req, res, next) => {
  try {
    if (req.session.signup) {
      res.redirect('/')
    } else if (req.session.login) {
      if (req.session.status === 'active') {
        res.redirect('/')
      } else {
        let msg = "YOUR ARE BLOCKED..!"
        res.render('user/login', { msg })
        req.session.login = false
      }

    } else {
      req.session.login = false
      let msg = 'USER NOT FOUND...!'
      res.render('user/login')
    }
  } catch (err) {
    next(err)
  }
})
// post login request
router.post('/login', (req, res, next) => {
  try {
    let user = req.body
    if (user) {
      credentialCheck.dologin(user).then((response) => {
        if (response.status) {
          if (response.active) {
            req.session.users = response.user
            req.session.login = true
            res.redirect('/')
          } else {
            req.session.login = true
            req.session.active = false
            res.redirect('/login')
          }

        } else {
          let msg = 'USER NOT FOUND...!'
          res.render('user/login', { msg })
        }

      })
    } else {

      res.redirect('/login')
    }
  } catch (err) {
    next(err)
  }
})


// render signup page
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
// product view 
router.get('/viewproduct/:id', (req, res, next) => {
 
    let proId = req.params.id
    console.log(proId)
    productdetails.viewproduct(proId).then((data) => {
      if (data) {
        console.log(data)
        res.render('user/viewproduct', { data, user: true })
      }
      else {
        console.log('product not found')
        res.redirect('/', { user: true })
      }
    })
  .catch ((err)=>{
   
      next(err)
  
  })
})
router.get('/category', (req, res, next) => {
  try {
    let users = req.session.users
    productdetails.getAllProducts().then((data) => {
      console.log(data)
      productdetails.getcategory().then((category) => {
        
        res.render('user/category', { category, data, users, user: true })
      })
    })
  } catch (err) {
    next(err)
  }
})
router.get('/categoryprods/:id', (req, res, next) => {
    let users = req.session.users
    console.log(req.params.id)
    productdetails.getCategoryProds(req.params.id).then((data) => {
      productdetails.getonecategory(req.params.id).then((category) => {
        console.log(category)
        res.render('user/categoryproduct', { category, data, users, user: true })
      })

    })
   .catch ((err)=> {
    next(err)
  })
})
router.get('/cart', verifylogin, (req, res, next) => {
  try {
    let users = req.session.users
    if (users) {
      console.log(users._id)
      cart.getcart(users._id).then((cartsitems) => {
        console.log(cartsitems)
        if (cartsitems) {
          if (cartsitems.product.length > 0) {
            productdetails.getcoupon().then(async (coupon) => {
              let totalamount = await cart.gettotalamount(users._id)
              console.log(totalamount + "in  helpers router")
              res.render('user/cart', { cartsitems, totalamount, coupon, users, user: true })
            })
          } else {
            res.redirect('/category')
          }
        } else {
          res.redirect('/category')
        }

      })
    } else {
      res.redirect('/login')
    }
  } catch (err) {
    next(err)
  }
})

router.get('/addcart/:id', verifylogin, (req, res, next) => {
    console.log('in add cart')
    let userId = req.session.users._id
    let proId = req.params.id
    console.log(proId)
    cart.addtocart(userId, proId).then((data) => {
      if (!data.duplicate) {
        console.log(data + 'user side')
        console.log("data received cart")
        res.json({ status: true })
      } else {
        res.json({ status: false })
      }
    })
  .catch ((err)=>{
    next(err)
  })
})
router.get('/inccartproduct/:id', verifylogin, (req, res, next) => {
  try {
    cart.inccart(req.params.id, req.session.users._id).then((data) => {
      if (data) {
        res.json({ data })
      }
    })
  } catch (err) {
    next(err)
  }
})
router.get('/mincartproduct/:id', verifylogin, (req, res, next) => {
  try {
    cart.mincart(req.params.id, req.session.users._id).then((data) => {
      if (data) {
        res.json({ data })
      }
    })
  } catch (err) {
    next(err)
  }
})
router.get('/deletecartproduct/:id', verifylogin, (req, res, next) => {
  try {
    cart.deletecartproduct(req.params.id, req.session.users._id).then((data) => {
      console.log('data returned')
      res.redirect('/cart')
    })
  } catch (err) {
    next(err)
  }
})
router.get('/addwishlist/:id', verifylogin, (req, res, next) => {
  try {
    let users = req.session.users
    console.log(req.params.id)
    cart.addWishList(req.params.id, users._id).then((response) => {
      if (!response.duplicate) {
        res.json({ status: true })
      } else {
        res.json({ status: false })
      }
    })
  } catch (err) {
    next(err)
  }
})
router.get('/wishlist', verifylogin, (req, res, next) => {
  try {
    let users = req.session.users
    console.log('in wishlist -----------------------')
    cart.getwishlist(users._id).then((wishlist) => {
      console.log(JSON.stringify(wishlist))
      res.render('user/wishlist', { wishlist, users, user: true })
    })
  } catch (err) {
    next(err)
  }
})
router.get('/unfavorite/:id', verifylogin, (req, res, next) => {
  try {
    let users = req.session.users
    cart.deletefavorite(req.params.id, users._id).then((response) => {
      console.log(response)
      res.redirect('/wishlist')
    })
  } catch (err) {
    next(err)
  }
})
router.post('/addAddress', verifylogin, (req, res, next) => {
  try {
    console.log(req.body)
    let user = req.session.users
    cart.addAddress(req.body, user._id).then((data) => {
      console.log(data)
      res.redirect('/checkout')
    })
  } catch (err) {
    next(err)
  }
})
router.get('/deleteAddress/:id', verifylogin, (req, res, next) => {
  try {
    let addressid = req.params.id
    console.log(addressid)
    cart.deleteAddress(addressid).then((data) => {
      console.log('address deleted')
      res.redirect('/checkout')
    })
  } catch (err) {
    next(err)
  }
})
router.get('/manageaddress',verifylogin, async(req,res,next)=>{
  try{
  let users = req.session.users
  let address = await cart.getAddress(users._id)
  res.render('user/manageaddress',{address,users,user:true})
  }
  catch(err){
    next(err)
  }
})
router.post('/profileAddAddress',verifylogin,(req,res,next)=>{
  try{
    let users = req.session.users
    cart.addAddress(req.body,users._id).then((data) => {
      console.log(data)
      res.redirect('/manageaddress')
    })
  }catch(err) { 
  next(err)
  }
})
router.post('/editaddress',verifylogin,(req,res,next)=>{
  try{
    console.log(req.body)
    cart.editAddress(req.body).then((address)=>{
      console.log(address)
      res.redirect('/manageaddress')
    })
  }catch(err){
    next(err)
  }
})
router.get('/removeaddress/:id', verifylogin, (req, res, next) => {
  try {
    let addressid = req.params.id
    console.log(addressid)
    cart.deleteAddress(addressid).then((data) => {
      console.log('address deleted')
      res.redirect('/manageaddress')
    })
  } catch (err) {
    next(err)
  }
})
router.get('/checkout', verifylogin, (req, res) => {

    
    let discount = req.session.discount
    
    let users = req.session.users
    
      cart.getcart(users._id).then((data) => {
        console.log(data,'data')
        cart.getAddress(users._id).then(async (address) => {
          let totalamount = await cart.gettotalamount(users._id, discount)
         
          res.render('user/checkoutpage', { users, address, totalamount, discount, data, user: true })
        }).catch((err)=>{console.log(err,'-------')})

      }).catch((err)=>{console.log(err,'----h---')})
  
  

})
router.post('/checkCoupon', verifylogin, (req, res, next) => {
  let users = req.session.users
  try {
    console.log(req.body)
    cart.checkcoupon(req.body, users._id).then(async (response) => {
      console.log('coupon founded')
      console.log(response)
      if (response.status) {
        console.log(req.body.coupon, "==", response.data.couponCode)
        if (req.body.coupon == response.data.couponCode) {
          console.log('coupons are same')
          let totalamount = await cart.gettotalamount(users._id, response.data.discount)
          req.session.coupon = response.data.couponCode
          req.session.discount = response.data.discount
          console.log(totalamount)
          res.json({ response, totalamount })
        } else {
          res.json({ response, totalamount })
        }
      } else {

        console.log(response)
        res.json({ response })
      }
    })
  } catch (err) {
    next(err)
  }
})
router.post('/checkoutorder', verifylogin, (req, res, next) => {
  try {
    
    let users = req.session.users
    console.log(req.body,'------checkout request body')
    cart.addorder(req.body, users._id).then(async (order) => {
      console.log(order)

      if (order.payment === 'cod') {
        cart.getorders(order._id).then((data) => {
          console.log(data)
          res.json(data)
        })
      } else {
        cart.generateRazorpay(order).then((response) => {
          res.json(response)
          console.log(response + "post checkorder")
        })
      }
    })
  
  } catch {
    next(err)
  }
})
router.post('/verifypayment', verifylogin, (req, res, next) => {
  try {
    console.log(req.body)
    cart.verifypayment(req.body).then(() => {
      cart.changepaymentstatus(req.body.order.receipt).then((data) => {
        console.log(data + 'payment successful')
        res.json({ status: true })
      })
    }).catch((err) => {
      console.log(err)
      res.json({ status: false })
    })
  } catch (err) {
    next(err)
  }
})


router.get('/order/:id', verifylogin, (req, res, next) => {
    let users = req.session.users
    cart.getorders(req.params.id).then((order) => {
      console.log(order + 'data received in order')
      req.session.discount = 0
      res.render('user/order', { order, users, user: true })
    })
   .catch ((err)=>{
    next(err)
  })
})

//   console.log(JSON.stringify(order)+"json order")
//   res.render('user/order',{order,users,user:true})
// })
// }
// else{
//   let postorder = req.body
//   res.render('user/onlinepayment',{postorder,user:true})
// cart.addorder(req.body).then(async(orders)=>{
//   let order = await cart.getorders(orders._id)
//   console.log('in else razorpay')
//   cart.generateRazorpay(order._id,order.totalamount).then((order)=>{
//     res.json({order})
//   })
// })
// res.redirect('/checkout')
// }

router.get('/onlinepayment', verifylogin, (req, res, next) => {
  try {
    cart.addorder(req.body).then(async (orders) => {
      let order = await cart.getorders(orders._id)
      console.log('in else razorpay')
      cart.generateRazorpay(order._id, order.totalamount).then((order) => {
        res.json({ order })
      })
    })
  } catch (err) {
    next(err)
  }
})
router.get('/orderdetails', verifylogin, (req, res, next) => {
  try {
    let users = req.session.users
    cart.getallorder(users._id).then((order) => {
      console.log(order)
      res.render('user/orderdetails', { order, users, user: true })
    })
  } catch (err) {
    next(err)
  }
})
router.get('/cancelorder/:id', (req, res, next) => {
    cart.cancelorder(req.params.id).then((response) => {
      res.redirect('/orderdetails')
    })
  .catch ((err)=>{
    next(err)
  })
})
router.get('/viewOrderDetails/:id', verifylogin, (req, res, next) => {
    let users = req.session.users
    cart.viewOrderDetails(req.params.id).then((orderDetails) => {
      res.render('user/order_detail', { orderDetails, users, user: true })
    })
  .catch ((err)=>{
    next(err)
  })
})
// get login request


router.get('/loginOtp', (req, res) => {
  res.render('user/loginOtp')
})
router.get('/signupOtp', (req, res) => {
  res.render('user/signupOtp')
})
router.get('/alldetails', verifylogin, async (req, res,next) => {
  try {
    users = req.session.users
    let totalorders = await cart.getallorder(users._id)
    let totalcart = await cart.getcart(users._id)
    let totalwishlist = await cart.getwishlist(users._id)
    let details = {
      totalorders,
      totalcart,
      totalwishlist
    }
    res.json({details})
  }catch(err){
    next(err)
  }
})

// user profile view

router.get('/userprofile', verifylogin, async (req, res, next) => {
  try {
    users = req.session.users
    let totalorders = await cart.getallorder(users._id)
    let totalcart = await cart.getcart(users._id)
    let totalwishlist = await cart.getwishlist(users._id)
    let address = await cart.getAddress(users._id)
    let oneaddress = address[0]
    console.log(totalwishlist)
    res.render('user/userprofile', { totalwishlist, users, totalorders, totalcart, oneaddress, user: true })
  } catch (err) {
    next(err)
  }
}),
  // edit userprofile

  router.post('/editprofile', verifylogin, (req, res, next) => {
    try {
      let users = req.session.users
      let edited = req.body
      console.log(edited, "hjzfgjhsbfgjsf-----sfgsdg-")
      userHelper.edituser(users._id, edited).then((data) => {
        if (data) {
          console.log(data + ' updated users')
          userHelper.userview(users._id).then((response) => {
            if (response) {
              req.session.users = response
              let users = req.session.users
              res.redirect('/userprofile')
            }
          })
        }
      })
    } catch (err) {
      next(err)
    }
  })


module.exports = router;
