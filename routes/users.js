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
/* HOME PAGE RENDERING */
const verifylogin = async(req, res, next) => {
  if (req.session.login) {
    let users = req.session.users
    console.log(users)
    let status = await userHelper.userview(users._id)
    if(status.status ==='active'){
      req.session.login = true
      next()
    }else{
      let msg = 'YOU ARE BLOCKED...!'
      req.session.login = false
      res.render('user/login',{msg})
    }  
  } else {
    res.redirect('/login')
  }
}
router.get('/', function (req, res, next) {
  let users = req.session.users
  console.log(users)
  productdetails.getAllProducts().then(async (data) => {
    let banners = await banner.getbanner()
    console.log(banners)
    let categories = await productdetails.getcategory()
    res.render('index', { banners, categories, data, users, user: true });
    console.log(banners)
 
  })
});
/* GET SIGNUP PAGE*/
router.get('/userSignup', (req, res) => {
  if (req.session.founded) {
    
    let msg = "THIS EMAIL IS ALREADY REGISTERED"
    res.render('user/userSignup',{msg})
  }
 
  res.render('user/userSignup')
})
/* POST SIGNUP PAGE */
router.post('/signup', (req, res) => {
  req.session.users = req.body
  let user = req.body
  credentialCheck.dosignUp(user).then((data) => {
    if (!data.founded) {
      req.session.signup = true
      req.session.login = true
      req.session.users = data
      res.redirect('/')
    } else {
      req.session.founded =true
      res.redirect('/userSignup')
    }

  })
})
/* GET LOGIN PAGE */
router.get('/login', async(req, res) => {
  if (req.session.signup) {
    res.redirect('/')
  } else if (req.session.login) {
      if(req.session.status=== 'active'){
        res.redirect('/')
      }else{
        let msg ="YOUR ARE BLOCKED..!"
        res.render('user/login',{msg})
        req.session.login = false
      }
    
  } else {
    req.session.login = false
    let msg ='USER NOT FOUND...!'
    res.render('user/login')
  }
})
// post login request
router.post('/login', (req, res) => {
  let user = req.body
  if (user) {
    credentialCheck.dologin(user).then((response) => {
      if (response.status) {
        if(response.active ){
          req.session.users = response.user
          req.session.login = true
          res.redirect('/')
        }else{
          req.session.login = true
          req.session.active = false
          res.redirect('/login')
        }
        
      } else {
        let msg ='USER NOT FOUND...!'
        res.render('user/login',{msg})
      }

    })
  } else {
    
    res.redirect('/login')
  }
})


// render signup page
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
// product view 
router.get('/viewproduct/:id', (req, res) => {
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
})
router.get('/category',(req, res) => {
  let users = req.session.users
  productdetails.getAllProducts().then((data) => {
    console.log(data)
    productdetails.getcategory().then((category) => {
      res.render('user/category', { category, data, users, user: true })
    })
  })
})
router.get('/categoryprods/:id', (req, res) => {
  let users = req.session.users
  console.log(req.params.id)
  productdetails.getCategoryProds(req.params.id).then((data) => {
    productdetails.getcategory().then((category) => {
      res.render('user/category', { category, data, users, user: true })
    })

  })
})
router.get('/cart',verifylogin, (req, res) => {
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
})

router.get('/addcart/:id', verifylogin,(req, res) => {
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
})
router.get('/inccartproduct/:id',verifylogin, (req, res) => {
  cart.inccart(req.params.id, req.session.users._id).then((data) => {
    if (data) {
      res.json({ data })
    }
  })
})
router.get('/mincartproduct/:id', verifylogin,(req, res) => {
  cart.mincart(req.params.id, req.session.users._id).then((data) => {
    if (data) {
      res.json({ data })
    }
  })
})
router.get('/deletecartproduct/:id',verifylogin, (req, res) => {
  cart.deletecartproduct(req.params.id, req.session.users._id).then((data) => {
    console.log('data returned')
    res.redirect('/cart')
  })
})
router.get('/addwishlist/:id',verifylogin, (req, res) => {
  let users = req.session.users
  console.log(req.params.id)
  cart.addWishList(req.params.id, users._id).then((response) => {
    if (!response.duplicate) {
      res.json({ status: true })
    } else {
      res.json({ status: false })
    }
  })
})
router.get('/wishlist', verifylogin,(req, res) => {
  let users = req.session.users
  console.log('in wishlist -----------------------')
  cart.getwishlist(users._id).then((wishlist) => {
    console.log(JSON.stringify(wishlist))
    res.render('user/wishlist', { wishlist, users, user: true })
  })
})
router.get('/unfavorite/:id',verifylogin, (req, res) => {
  let users = req.session.users
  cart.deletefavorite(req.params.id, users._id).then((response) => {
    console.log(response)
    res.redirect('/wishlist')
  })
})
router.post('/addAddress',verifylogin, (req, res) => {
  console.log(req.body)
  let user = req.session.users
  cart.addAddress(req.body, user._id).then((data) => {
    console.log(data)
    res.redirect('/checkout')
  })
})
router.get('/deleteAddress/:id',verifylogin, (req, res) => {
  let addressid = req.params.id
  console.log(addressid)
  cart.deleteAddress(addressid).then((data) => {
    console.log('address deleted')
    res.redirect('/checkout')
  })
})

router.get('/checkout',verifylogin, async (req, res) => {
  console.log('-----------------------')
  let discount = req.session.discount
  console.log(coupon) + "-------sjfhasjfajsnfajd"
  let users = req.session.users
  if (users) {
    cart.getcart(users._id).then((data) => {
      console.log(data)
      cart.getAddress(users._id).then(async (address) => {
        let totalamount = await cart.gettotalamount(users._id, discount)
        console.log(totalamount, '---------')
        console.log(address + "hfa;lsdjfhalsdjfhlasdjhf")
        res.render('user/checkout', { users, address, totalamount, discount, data, user: true })
      })

    })
  } else {
    res.redirect('/login')
  }

})
router.post('/checkCoupon',verifylogin, (req, res) => {
  let users = req.session.users
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
})
router.post('/checkoutorder',verifylogin, (req, res) => {
  let users = req.session.users
  console.log(req.body)
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
})
router.post('/verifypayment',verifylogin, (req, res) => {
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
})


router.get('/order/:id',verifylogin, (req, res) => {
  let users = req.session.users
  cart.getorders(req.params.id).then((order) => {
    console.log(order + 'data received in order')
    req.session.discount = 0
    res.render('user/order', { order, users, user: true })
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

router.get('/onlinepayment',verifylogin, (req, res) => {
  cart.addorder(req.body).then(async (orders) => {
    let order = await cart.getorders(orders._id)
    console.log('in else razorpay')
    cart.generateRazorpay(order._id, order.totalamount).then((order) => {
      res.json({ order })
    })
  })
})
router.get('/orderdetails',verifylogin, (req, res) => {
  let users = req.session.users
  cart.getallorder(users._id).then((order) => {
    console.log(order)
    res.render('user/orderdetails', { order, users, user: true })
  })
})
router.get('/cancelorder/:id',(req,res)=>{
 cart.cancelorder(req.params.id).then((response)=>{
  res.redirect('/orderdetails')
 })
})
router.get('/viewOrderDetails/:id',verifylogin, (req, res) => {
  let users = req.session.users
  cart.viewOrderDetails(req.params.id).then((orderDetails) => {
    res.render('user/order_detail', { orderDetails, users, user: true })
  })
})
// get login request


router.get('/loginOtp', (req, res) => {
  res.render('user/loginOtp')
})
router.get('/signupOtp', (req, res) => {
  res.render('user/signupOtp')
})


// user profile view

router.get('/userprofile',verifylogin, (req, res) => {
  users = req.session.users
  res.render('user/userprofile', { users, user: true })
})

// edit userprofile

router.post('/editprofile',verifylogin, (req, res) => {
  let edited = req.body
  console.log(edited)
  userHelper.edituser(edited).then((data) => {
    if (data) {
      console.log(data + ' updated users')
      userHelper.userview(edited._Id).then((response) => {
        if (response) {
          req.session.users = response
          let users = req.session.users
          res.redirect('/userprofile')
        }
      })
    }
  })
})


module.exports = router;
