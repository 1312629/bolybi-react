var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Cart = mongoose.model('Cart');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.register = function(req, res) {
    var avatar;
    if (req.files.length > 0) {
        console.log("Test" + req.files[0]);
        avatar = "./" + req.files[0].path;
    } else {
        avatar = "./images/avatar_default.png";
    }
    
    if (!req.body.name || !req.body.email || !req.body.password) {
        sendJSONresponse(res, 400, {"message": "All fields are required!"});
        return; 
    }
    
    var user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.setPassword(req.body.password);
    var cart = new Cart();
    cart.user = user._id;
    cart.cartDetails = [];
    user.cart = cart._id;
    user.avatarURL = avatar;
    
    user.save(function(err){
        if (err) {
            sendJSONresponse(res, 404, err);
            return;
        } else {
            cart.save(function(err){
                if (err) {
                    sendJSONresponse(res, 404, err);
                    return; 
                }
                var token;
                token = user.generateJwt();
                sendJSONresponse(res, 200, {"token": token});
                return;
            })          
        }
    })
};

module.exports.login = function(req, res) {
    if (!req.body.email || !req.body.password) {
        sendJSONresponse(res, 400, {"message": "All fields are required!"});
        return;
    }
    passport.authenticate('local', function(err, user, info) {
        var token;
        if (err) {
            sendJSONresponse(res, 404, err);
            return;
        }
        console.log(user);
        if (user) {
            token = user.generateJwt();
            sendJSONresponse(res, 200, {"token": token});
            return;
        } else {
            sendJSONresponse(res, 401, {"message": "Account doesn't exist!"});
        }
    }) (req, res);
}