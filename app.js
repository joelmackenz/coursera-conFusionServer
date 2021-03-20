var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('./express-sesion');
var FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');;

const Dishes = require('./models/dishes');
const e = require('express');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);
connect.then((db) => {
  console.log('Connected to server')
}, (err) => { console.log(err)});

var app = express();;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890'));

app.use(session({
  name: 'session-id-Joel',
  secret: '12345-67890',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);

//Authorization

function auth(req, res, next) {
  console.log(req.session);

  if (!req.session.user) {
      var err = new Error('You are not authenticated!')
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err) 
    } else {
    if (req.session.user === 'authenticated') {
      next();
    } else {
      var err = new Error('You are not authenticated!')
      err.status = 403;
      return next(err) 
    }
  }

  var authHeader = req.headers.authorization;

  // client did not include username and password in header
  if (!authHeader) {
    var err = new Error('You are not authenticated!')
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err) 
  }

  //first split separates the base64 code into the word "basic" and the code, and the second split
  //separates the username and password in the base64  code
  var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')

  var username = auth[0];
  var password = auth[1];

  if (username === 'admin' && password === 'password') {
    next();
  }
  else {
    var err = new Error('You are not authenticated!')
    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    return next(err) 
  }

};

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter)

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
