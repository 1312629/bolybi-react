var mongoose = require('mongoose');
var _ = require('lodash');
var Cart = mongoose.model('Cart');
var User = mongoose.model('User');
var Item = mongoose.model('Item');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

var getCartIdByUser = function(req, res, callback) {
    console.log(req.payload);
    console.log("Finding cart id with email " + req.payload.email);
    console.log("Finding cart id with fb id " + req.payload.fbId);
    if (req.payload.fbId) {
        User
          .findOne({fbId : req.payload.fbId})
          .exec(function(err, user) {
            if (!user) {
              sendJSONresponse(res, 404, {
                "message": "User not found!"
              });
              return;
            } else if (err) {
              console.log(err);
              sendJSONresponse(res, 404, err);
              return;
            }
            console.log(user);
            callback(req, res, user.cart);
          });
    } else if (req.payload.email) {
        User
          .findOne({email : req.payload.email})
          .exec(function(err, user) {
            if (!user) {
              sendJSONresponse(res, 404, {
                "message": "User not found!"
              });
              return;
            } else if (err) {
              console.log(err);
              sendJSONresponse(res, 404, err);
              return;
            }
            console.log(user);
            callback(req, res, user.cart);
          });
    } else {
        sendJSONresponse(res, 404, {
          "message": "User not found!"
        });
        return;
    }
};

var findPrice = function(id, items) {
    var item = _.find(items, {_id: id});
    return item.price - item.discount;
};

/* Get 1 Cart */
module.exports.getByUser = function(req, res) {
    getCartIdByUser(req, res, function(req, res, cartId) {
        if (cartId) {
            Cart.findById(cartId).populate('cartDetails.item').exec(function(err, cart){
                if (!cart) {
                    sendJSONresponse(res, 404, {"message": "cartId not found!"});
                    return;
                } else if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }
                sendJSONresponse(res, 200, cart);
            });
        } else {
            sendJSONresponse(res, 404, {"message": "cartId not found!"});
            return;
        }
    })
};

/* Get 1 Cart */
module.exports.cartGet = function(req, res) {
    if (!req.params.cartid) {
        sendJSONresponse(res, 404, {"message": "missing cartId!"});
        return;
    }
    Cart.findById(req.params.cartid).populate('cartDetails.item').exec(function(err, cart){
        if (!cart) {
            sendJSONresponse(res, 404, {"message": "cartId not found!"});
            return;
        } else if (err) {
            sendJSONresponse(res, 400, err);
            return;
        }
        cart.total = 0;
        for (var i = 0; i < cart.cartDetails.length; i++) {
            cart.cartDetails[i].total = cart.cartDetails[i].quantity * (cart.cartDetails[i].item.price - cart.cartDetails[i].item.discount);
            cart.total += cart.cartDetails[i].total;
        }
        cart.save(function(err, cart) {
            if (err) {
                sendJSONresponse(res, 400, err);
            } else {
                sendJSONresponse(res, 200, cart);
            }
        });
    });
};

/* Update Cart */
module.exports.cartUpdate = function(req, res) {
    getCartIdByUser(req, res, function(req, res, cartid) {
        if (!cartid) {
            sendJSONresponse(res, 404, {"message": "missing cartId!"});
            return;
        }
        Cart.findById(cartid).exec(function(err, cart){
            if (!cart) {
                sendJSONresponse(res, 404, {"message": "cartId not found!"});
                return;
            } else if (err) {
                sendJSONresponse(res, 400, err);
                return;
            }
            Item.find().exec(function(err, items) {
                if (!items) {
                    sendJSONresponse(res, 404, {"message": "nothing"});
                    return;
                } else if (err) {
                    sendJSONresponse(res, 404, err);
                    return;
                }
                cart.cartDetails = req.body.cartDetails;
                cart.total = 0;
                for (var i = 0; i < cart.cartDetails.length; i++) {
                    if (findPrice(cart.cartDetails[i].item, items)) {
                        cart.cartDetails[i].total = cart.cartDetails[i].quantity * findPrice(cart.cartDetails[i].item, items);
                        cart.total += cart.cartDetails[i].total;
                    } else {
                        sendJSONresponse(res, 400, err);
                        return;
                    }
                }
                cart.save(function(err, cart) {
                    if (err) {
                        sendJSONresponse(res, 404, err);
                    } else {
                        for (var i = 0; i < cart.cartDetails.length; i++) {
                            cart.cartDetails[i].item = _.find(items, {_id: cart.cartDetails[i].item});
                        }
                        sendJSONresponse(res, 200, cart);
                    }
                });
            });
        });
    });
};

/* Add New Cart */
module.exports.cartCreate = function(req, res) {
    Cart.create(req.body, function(err, cart) {
        if (err) {
            console.log(err);
            sendJSONresponse(res, 400, err);
        } else {
            console.log(cart);
            sendJSONresponse(res, 201, cart);
        }
    });
};