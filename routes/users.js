var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

//Below: a post request from a user, including username and password in json format.
//If username already exists, error is passed
router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    if(user != null) {
      var err = new Error('User ' + req.body.username + ' already exists')
      err,status = 403;
      next(err)
    } else {
      return User.create({
        username: req.body.username,
        password: req.body.password
      })
    }
  })
  .then ((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    res.json({status: 'Registration Successful', user: user})
  }, (err) => next(err))
  .catch((err) => next(err));
});

router.post('/login', (req, res, next) => {
  if (!req.session.user) { //user has not authenticated
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
  
    User.findOne({username: username})
    .then((user) => {
      if (user === null) {
        var err = new Error(`User ${username} does not exist.`)
        err.status = 403;
        return next(err) 
      }
      else if (user.password !== password) {
        var err = new Error(`Password incorrect.`)
        err.status = 403;
        return next(err) 
      }
      else if (user.username === username && user.password === password) {
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain')
        res.end('You are authenticated.')
      }
    })
    .catch((err) => next(err))
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated.')
  }
});

router.get('/logout', (req, res) => {
  if(req.session) {
    req.session.destroy() //all info about session is removed on server side
    res.clearCookie('session-id'); //clears info on client side 
    res.redirect('/');
  } else {
    var err = new Error('You aren\'t logged in!')
    err.status = 403;
    next(err);
  }
})

module.exports = router;
