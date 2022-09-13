const e = require('express');
var express = require('express');
const { Admin } = require('mongodb');
var router = express.Router();
var credentialCheck = require('../credentialCheck/adminCheck')
var userdetails = require('../adminHelpers/userHelper');
const { response } = require('../app');
const productdetails = require('../adminHelpers/productHelper')
const banner = require('../adminHelpers/bannerHelpers')
const cart = require('../userHelper/cart');
const order = require('../schemaModel/order');
const verifyadmin = async(req,res,next)=>{
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin/adminlogin')
  }
}
/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.admin) {

    res.render('admin/adminIndex', { admin: true });

  } else {
    res.redirect('/admin/adminlogin')
  }
})
router.get('/orderChart', (req, res) => {
  console.log("-------------")
  userdetails.getorders().then((orders) => {
    console.log(orders)
    res.json(orders)
  })
})
router.post('/login', (req, res) => {
  if (!req.session.admin) {
    let admin = req.body
    console.log(admin)
    credentialCheck.dologin(admin).then((response) => {
      if (response.status) {
        req.session.admin = true
        req.session.admindetails = req.body
        res.redirect('/admin/')
      }else{
        req.session.admin= false
        res.redirect('/admin/adminLogin')
      }
    })
  } else {
    req.session.admin = false
    res.redirect('/admin/adminLogin')
  }
})
router.get('/adminLogin',(req,res)=>{
  if(req.session.admin){
    res.redirect('/admin/')
  }else{
    res.render('admin/adminLogin')
  }
})
router.get('/usermanagment',verifyadmin,(req, res) => {

  userdetails.getAllUserDetails().then((data) => {
    let allusers = data

    
      console.log(allusers)
      res.render('admin/adminusermanagment', { allusers, admin: true })
    
  })
  router.get('/blockuser/:id', verifyadmin,(req, res) => {
    let userId = req.params.id
    console.log(userId)
    userdetails.blockuser(userId).then((response) => {
      res.json({ response })
    })
  })
  router.get('/unblockuser/:id', verifyadmin,(req, res) => {
    let userId = req.params.id
    console.log(userId)
    userdetails.unblockuser(userId).then((response) => {
      res.json({ response })
    })
  })
  router.get('/viewuser/:id',verifyadmin, (req, res) => {
    let user = req.params.id
    console.log(user)
    userdetails.userview(user).then((response) => {
      console.log(response)
      let users = response
      res.render('admin/adminuserview', { users, admin: true })
    })

  })
})
router.get('/adminlogin', (req, res) => {
  if (req.session.admin) {
    res.redirect('/admin/')
  } else {
    req.session.admin = false
    res.render('admin/adminLogin')

  }
})
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/admin/adminlogin')
})

// product router start
router.get('/allproducts',verifyadmin, (req, res) => {
 
    productdetails.getcategory().then()
    productdetails.getAllProducts().then((allProducts) => {
      console.log(allProducts)
      res.render('admin/products', { allProducts, admin: true })
    })
 
})
router.get('/addproducts',verifyadmin, (req, res) => {
 
    productdetails.getcategory().then((category) => {
      console.log(category)
      res.render('admin/addproducts', { category, admin: true })
    })
  
})
router.post('/addproducts', verifyadmin,(req, res) => {
  console.log(req.body)
  // console.log(req.files.image)
  productdetails.addProducts(req.body).then((data) => {
    if (data) {

      console.log(data._id)
      req.files.image.mv('./public/productsimage/' + data._id + '.jpg')
    }
  })
  res.redirect('/admin/allproducts')
})
router.get('/viewproduct/:id',verifyadmin, (req, res) => {
  let proId = req.params.id
  productdetails.viewproduct(proId).then((data) => {
    if (data) {
      console.log(data)
      res.render('admin/viewproduct', { data, admin: true })

    }
  })
})
router.get('/editproduct/:id',verifyadmin, (req, res) => {
  let proId = req.params.id
  productdetails.viewproduct(proId).then((data) => {
    if (data) {
      console.log(data)
      res.render('admin/editproduct', { data, admin: true })
    }
  })
})
router.post('/editproduct/:id',verifyadmin, (req, res) => {
  console.log(req.params.id)
  let proedit = req.body
  let proId = req.params.id
  console.log(proedit)
  productdetails.editproduct(proId, proedit).then((data) => {
    if (data) {
      console.log(data._id)
      req.files.image.mv('./public/productsimage/' + data._id + '.jpg',
        (err, done) => {
          if (err) console.log(err)
        })

      res.redirect('/admin/viewproduct/' + proId)
    }
  })
})
router.get('/deleteproduct/:id', verifyadmin,(req, res) => {
  let proId = req.params.id
  console.log(proId)
  productdetails.deleteproduct(proId).then((response) => {
    res.redirect('/admin/allproducts/')
  })
})
router.post('/addbanner',verifyadmin, (req, res) => {
  banner.addbanner(req.body).then((data) => {
    console.log(data)
    req.files.image.mv('./public/bannerimage/' + data._id + '.png')
  })
  res.redirect('/admin/banner')
})
router.get('/banner',verifyadmin, (req, res) => {
  banner.getbanner().then((data) => {
    productdetails.getAllProducts().then((products) => {
      console.log(products + "hai")
      res.render('admin/banner', { products, data, admin: true })
    })
  })
  router.post('/updatebanner/:id',verifyadmin, (req, res) => {
    banner.editbanner(req.params.id, req.body).then((data) => {
      console.log(data)
      res.redirect('/admin/banner')
    })
  })
  router.get('/deletebanner/:id',verifyadmin, (req, res) => {
    banner.deletebanner(req.params.id).then((data) => {
      console.log('returned to admin page')
      res.redirect('/admin/banner')
    })
  })
})
router.get('/category',verifyadmin, (req, res) => {
  productdetails.getcategory().then((category) => {
    console.log(category)
    // let message = 'THIS CATEGORY IS ALREADY EXISTS'
    res.render('admin/category', { category, admin: true })
  })
}) 
router.post('/category', verifyadmin,(req, res) => {
  productdetails.addcategory(req.body).then((data) => {
    console.log(data.duplicate)
    if (data) {
      console.log(data)
      req.files.image.mv('./public/categoryimage/' + data._id + '.jpg')
      res.redirect('/admin/category')
    }
    else {
      console.log(categoryerr)
      res.redirect('/admin/category')
    }
  })
  console.log(req.body)
})
router.get('/coupon',verifyadmin, (req, res) => {
  productdetails.getcoupon().then((data) => {
    console.log(data)
    res.render('admin/coupon', { data, admin: true })
  })

})
router.post('/addcoupon',verifyadmin, (req, res) => {
  productdetails.addcoupon(req.body).then((data) => {
    console.log('returned to admin js')
    res.redirect('/admin/coupon')
  })
})
router.get('/deletecoupon/:id',verifyadmin, (req, res) => {
  productdetails.deletecoupon(req.params.id).then((data) => {
    console.log('deleted')
    if (data) {
      res.redirect('/admin/coupon')
    }
  })
})
router.get('/orders',verifyadmin, (req, res) => {
  userdetails.getorders().then((response) => {
    console.log(response)
    res.render('admin/userOrders', { response, admin: true })
  })
})
router.get('/orderDetails/:id',verifyadmin,(req, res) => {
  console.log(req.params.id)
  userdetails.viewOrder(req.params.id).then((order) => {
    console.log(order)
    res.render('admin/orderDetails', { order, admin: true })
  })
})
router.post('/changestatus', verifyadmin,(req, res) => {
  console.log(req.body)
  userdetails.changestatus(req.body.id, req.body.status).then((response) => {
    console.log(response)
    if (response) {
      res.json({ status: true })
    } else {
      res.json({ status: false })
    }

  })
})

module.exports = router;





// router.post('/signup',(req,res)=>{
//   let admin = req.body
//   credentialCheck.dosignUp(admin).then((data)=>{
//     res.redirect('/admin/adminlogin')
//   })
// })