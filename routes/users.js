var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
const { authenticate } = require('passport');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

//Below: a post request from a user, including username and password in json format.
//If username already exists, error is passed
router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
      if(err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json')
        res.json({err: err});
      } else {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json')
          res.json({success: true, status: 'Registration Successful', user: user})
        });
    }
  });
});

router.post('/login', passport.authenticate('local'), (req, res) => {

  var token = authenticate.getToken({_id: req.user._id})
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json')
  res.json({success: true, token: token, status: 'You are successfully logged in.', user: user})
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
