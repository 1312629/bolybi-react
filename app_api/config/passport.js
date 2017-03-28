var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Cart = mongoose.model('Cart');

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
    function(username, password, done) {
        User.findOne({email: username}, function(err, user) {
            if (err) { return done(err);}
            if (!user) {
                return done(null, false, {message: 'Incorrect email.'});
            }
            if (!user.validPassword(password)) {
                return done(null, false, {message: 'Incorrect password.'});
            }
            return done(null, user);
        })
  }
));

passport.use(new FacebookTokenStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET
    }, 
    function(accessToken, refreshToken, profile, done) {
        User.findOne({fbId: profile.id}, function(err, user) {
            if (err) { return done(err);}
            if (!user) {
                var user = new User();
                user.name = profile.displayName;
                user.fbId = profile.id;
                var cart = new Cart();
                cart.user = user._id;
                cart.cartDetails = [];
                user.cart = cart._id;
                if (profile.photos.length > 0) {
                    user.avatarURL = profile.photos[0].value;
                }
                console.log(user);
                user.save(function(err){
                    if (err) {
                         if (err) { return done(err);}
                    } else {
                        cart.save(function(err){
                            if (err) { return done(err);}
                            return done(null, user);
                        })          
                    }
                })
            } else {
                return done(null, user);
            }
        });
    }
));
