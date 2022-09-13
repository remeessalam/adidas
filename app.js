var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session')
const mongoose = require('mongoose');
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var hbs = require('express-handlebars')
var app = express();
const fileupload = require('express-fileupload');
const { ifError } = require('assert');
const env = require('dotenv').config()
mongoose.connect(process.env.mongo_url).then((res)=>{
  console.log('db connect') 
})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials',
  helpers: {
    total: function (qty, price) {
      return parseInt(qty) * parseInt(price);
    },
    subTotal: function (product) {
      let subtotal = 0;
      console.log(JSON.stringify(product)+'haiiiii');
      for (let i = 0; i < product.length; i++) {
        subtotal = subtotal +parseInt(product[i].productid.price) * product[i].quantity;
        console.log('hai')
      }
      return subtotal;
    },
    totalamounts : (product)=>{
      let subtotal = subtotal(product)
    },
    
    json: function (carts) {
      return JSON.stringify(carts);
    },
    date: function(date){
      let data = date+""
      return data.slice(3, 16);
    },
    dateof: function(date){
      let data = date+""
      return data.slice(0, 10);
    },
    uppercase : (text )=>{
      let uppercase = text.toUpperCase()
      return uppercase
    },
    check : (status)=>{
      if(status ==='active'){
        return 'Block'
      }
      else{
        return 'Unblock'
      }
    },
    addr : (addres)=>{
      let curr = addres[0].house
      return curr
    }
    
    
  }
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload());
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})
app.use('/admin', adminRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');   
});

module.exports = app;
