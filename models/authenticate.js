//all authentication strategies

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

exports.local = passport.use(new LocalStrategy(User.authenticate())); //passport-local-mongoose allows User.authenticate. It is a user auth function.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); //Session support for passport