var mongoose = require('mongoose');
var Order = mongoose.model('Order');
var User = mongoose.model('User');
var Item = mongoose.model('Item');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

var checkUser = function(req, res, callback) {
  if (req.payload.email) {
    User
      .findOne({email : req.payload.email})
      .exec(function(err, user) {
        if (!user) {
          sendJSONresponse(res, 404, {
            "message": "User not found!"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 404, err);
          return;
        }
        callback(req, res, user);
      });

  } else {
        sendJSONresponse(res, 404, {
          "message": "User not found!"
        });
        return;
  }
};

/* Get List Order */
module.exports.listOrders = function(req, res) {
    checkUser(req, res, function(req, res, user) {
        if (user) {
            if (user.type == 'User'){
                Order.find({owner: user._id}).populate('orderDetails.item').exec(function(err, orders){
                    if (!orders) {
                        sendJSONresponse(res, 401, {"message": "Not found!"});
                        return;
                    } else if (err) {
                        sendJSONresponse(res, 400, err);
                        return;
                    }
                    sendJSONresponse(res, 200, orders);
                    return;
                });
            } else {
                if (req.query.status == null) {
                    Order.find().populate('owner').populate('orderDetails.item').exec(function(err, orders){
                        if (!orders) {
                            sendJSONresponse(res, 401, {"message": "Not found!"});
                            return;
                        } else if (err) {
                            sendJSONresponse(res, 400, err);
                            return;
                        }
                        sendJSONresponse(res, 200, orders);
                    });
                } else {
                    Order.find({status: req.query.status}).populate('owner').populate('orderDetails.item').exec(function(err, orders){
                        if (!orders) {
                            sendJSONresponse(res, 401, {"message": "Not found!"});
                            return;
                        } else if (err) {
                            sendJSONresponse(res, 400, err);
                            return;
                        }
                        sendJSONresponse(res, 200, orders);
                        return;
                    });
                }
            }
        } else {
            sendJSONresponse(res, 404, {"message": "User not found!"});
            return;
        }
    })
};


/* Add New Order */
module.exports.orderCreate = function(req, res) {
    checkUser(req, res, function(req, res, user) {
        var count = 0;
       /* for (var i = 0; i < req.body.orderDetails.length; i++) {
            Item.findById(req.body.orderDetails[i].item).exec(function(err, item){
                if (!item) {
                    sendJSONresponse(res, 401, {"message": "Invalid item in detail " + i});
                } else if (err) {
                    sendJSONresponse(res, 401, err);
                } else {
                    for (var j = 0; j < item.itemDetails.length; j++) {
                        console.log(req.body.orderDetails[i]);
                        console.log(item.itemDetails[j]);
                        if (item.itemDetails[j].size == req.body.orderDetails[i].size) {
                            if (item.itemDetails[j].quantity < req.body.orderDetails[i].quantity) {
                                sendJSONresponse(res, 401, {"message": "Exceed max quantity!\n" + item.name + " SIZE: " + item.itemDetails[j].size + " MAX: " + item.itemDetails[j].quantity});
                                return;
                            }
                            count++;
                            if (count == req.body.orderDetails.length) {
                                count = 0;
                                for (var m = 0; m < req.body.orderDetails.length; m++) {
                                    Item.findById(req.body.orderDetails[m].item).exec(function(err, item){
                                        if (!item) {
                                            sendJSONresponse(res, 401, {"message": "Invalid item in detail " + i});
                                        } else if (err) {
                                            sendJSONresponse(res, 401, err);
                                        } else {
                                            for (var n = 0; n < item.itemDetails.length; n++) {
                                                if (item.itemDetails[n].size == req.body.orderDetails[m].size) {
                                                    item.itemDetails[n].quantity -= req.body.orderDetails[m].quantity;
                                                    item.save(function(err, item){
                                                        if (err) {
                                                            sendJSONresponse(res, 401, err);
                                                        } else {
                                                            count++;
                                                            if (count == req.body.orderDetails.length) {
                                                                Order.create(req.body, function(err, order) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                        sendJSONresponse(res, 400, err);
                                                                    } else {
                                                                        sendJSONresponse(res, 201, order);
                                                                    }
                                                                })  
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            })
        } */
        
        Item.find().exec(function(err, items){
            for (var i = 0; i < req.body.orderDetails.length; i++) {
                for (var j = 0; j < items.length; j++) {
                    for (var k = 0; k < items[j].itemDetails.length; k++) {
                        if (req.body.orderDetails[i].size == items[j].itemDetails[k].size) {
                            if (req.body.orderDetails[i].quantity > items[j].itemDetails[k].quantity) {
                                sendJSONresponse(res, 401, {"message": "Exceed max quantity!\n" + items[j].name + " SIZE: " + items[j].itemDetails[k].size + " MAX: " + items[j].itemDetails[k].quantity});
                                return;
                            }
                        }
                    }
                }
            }
            req.body.total = 0;
            for (var i = 0; i < req.body.orderDetails.length; i++) {
                for (var j = 0; j < items.length; j++) {
                    for (var k = 0; k < items[j].itemDetails.length; k++) {
                        if (req.body.orderDetails[i].size == items[j].itemDetails[k].size) {
                            items[j].itemDetails[k].quantity -= req.body.orderDetails[i].quantity;
                            req.body.orderDetails[i].price = items[j].price;
                            req.body.orderDetails[i].discount = items[j].discount;
                            req.body.orderDetails[i].total = (items[j].price - items[j].discount) * req.body.orderDetails[i].quantity;
                            req.body.total += req.body.orderDetails[i].total;
                            items[j].save(function(err, item){
                                if (err) {
                                    sendJSONresponse(res, 401, err);
                                } else {
                                    count++;
                                    if (count == req.body.orderDetails.length) {
                                        Order.create(req.body, function(err, order) {
                                            if (err) {
                                                console.log(err);
                                                sendJSONresponse(res, 400, err);
                                            } else {
                                                sendJSONresponse(res, 201, order);
                                            }
                                        })  
                                    }
                                }
                            });
                        }
                    }
                }
            }
        });
    });
};

/* Get 1 Order */
module.exports.orderGet = function(req, res) {
    checkUser(req, res, function(req, res, user) {
        if (!req.params.orderid) {
            sendJSONresponse(res, 404, {"message": "missing orderId!"});
            return;
        }
        Order.findById(req.params.orderid).exec(function(err, order){
            if (!order) {
                sendJSONresponse(res, 404, {"message": "orderId not found!"});
                return;
            } else if (err) {
                sendJSONresponse(res, 400, err);
                return;
            }
            sendJSONresponse(res, 200, order);
        });
    });
};

/* Report */
module.exports.report = function(req, res) {
    Order.aggregate([
        {
            $group : {
               _id : {day: { $dayOfMonth: "$createdDate" }, month: { $month: "$createdDate" }, year: { $year: "$createdDate" } },
               totalPrice: { $sum: "$total" },
               count: { $sum: 1 }
            }
        }
    ], function (err, result) {
        if (err) {
            sendJSONresponse(res, 400, err);
        } else {
            sendJSONresponse(res, 200, result);
        }
    });
//        Order.findById(req.params.orderid).exec(function(err, order){
//            if (!order) {
//                sendJSONresponse(res, 404, {"message": "orderId not found!"});
//                return;
//            } else if (err) {
//                sendJSONresponse(res, 400, err);
//                return;
//            }
//            sendJSONresponse(res, 200, order);
//        });
//    });
};

/* Update 1 Order */
module.exports.orderUpdate = function(req, res) {
    checkUser(req, res, function(req, res, user) {
        if (!req.params.orderid) {
            sendJSONresponse(res, 404, {"message": "missing orderId!"});
            return;
        }
        Order.findById(req.params.orderid).exec(function(err, order){
            if (!order) {
                sendJSONresponse(res, 404, {"message": "orderId not found!"});
                return;
            } else if (err) {
                sendJSONresponse(res, 400, err);
                return;
            }
            order.note = req.body.note;
            order.status = req.body.status;
            order.updatedDate = new Date();
            order.save(function(err, order){
                order.populate('owner', function(err){
                     
                    if (err) {
                        sendJSONresponse(res, 401, err);
                    } else {
                        order.populate('orderDetails.item', function(err){
                             if (err) {
                                sendJSONresponse(res, 401, err);
                             } else {
                                 sendJSONresponse(res, 200, order);
                             }
                        });
                    }
                });
            });
        });
    });
};