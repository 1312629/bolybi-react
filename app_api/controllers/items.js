var mongoose = require('mongoose');
var Item = mongoose.model('Item');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

var getUser = function(req, res, callback) {
  console.log("Finding user id with email " + req.payload.email);
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
            callback(req, res, user._id);
          });
    } else if (req.payload.email) {
    User
      .findOne({ email : req.payload.email })
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
        callback(req, res, user._id);
      });

  } else {
    sendJSONresponse(res, 404, {
      "message": "User not found!"
    });
    return;
  }
};

/* Get List Items */
module.exports.itemsList = function(req, res) {
    if (req.query.type != null) {
        Item.find({type: req.query.type}).exec(function(err, items) {
            if (!items) {
                sendJSONresponse(res, 404, {"message": "nothing"});
                return;
            } else if (err) {
                sendJSONresponse(res, 404, err);
                return;
            }
            sendJSONresponse(res, 200, items);
        });
    } else {
        Item.find().exec(function(err, items) {
            if (!items) {
                sendJSONresponse(res, 404, {"message": "nothing"});
                return;
            } else if (err) {
                sendJSONresponse(res, 404, err);
                return;
            }
            sendJSONresponse(res, 200, items);
        });
    }
};

/* Get 1 Item */
module.exports.itemGet = function(req, res) {
    if (!req.params.itemid) {
        sendJSONresponse(res, 404, {"message": "missing itemId!"});
        return;
    }
    Item.findById(req.params.itemid).exec(function(err, item){
        if (!item) {
            sendJSONresponse(res, 404, {"message": "itemId not found!"});
            return;
        } else if (err) {
            sendJSONresponse(res, 400, err);
            return;
        }
        sendJSONresponse(res, 200, item);
    });
};

/* Add New Item */
module.exports.itemCreate = function(req, res) {
    getUser(req, res, function(req, res, userid){
        req.body.item = JSON.parse(req.body.item);
        for (var i = 0; i < req.files.length; i++) {
            var itemMeta = {
                metaKey: "imgUrl",
                metaValue: req.files[i].path
            };
            req.body.item.itemMetas.push(itemMeta);
        }
        Item.create(req.body.item, function(err, item) {
            if (err) {
                console.log(err);
                sendJSONresponse(res, 400, err);
            } else {
                console.log(item);
                sendJSONresponse(res, 201, item);
            }
        });
    })
};

/* Update Item */
module.exports.itemUpdate = function(req, res) {
    getUser(req, res, function(req, res, userid){
        if (!req.params.itemid) {
            sendJSONresponse(res, 404, {"message": "missing itemId!"});
            return;
        }
        Item.findById(req.params.itemid).exec(function(err, item){
            if (!item) {
                sendJSONresponse(res, 404, {"message": "itemId not found!"});
                return;
            } else if (err) {
                sendJSONresponse(res, 400, err);
                return;
            }
            item.name = req.body.name;
            item.color = req.body.color;
            item.description = req.body.description;
            item.updatedDate = new Date();
            item.category = req.body.category;
            item.gender = req.body.gender;
            item.type = req.body.type;
            item.price = req.body.price;
            item.discount = req.body.discount;
            item.itemMetas = req.body.itemMetas;
            item.itemDetails = req.body.itemDetails;
            item.save(function(err, item) {
                if (err) {
                    sendJSONresponse(res, 404, err);
                } else {
                    sendJSONresponse(res, 200, item);
                }
            });
        });
    });
};