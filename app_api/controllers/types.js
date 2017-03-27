var mongoose = require('mongoose');
var User = mongoose.model('User');
var Type = mongoose.model('Type');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

var getUser = function(req, res, callback) {
  console.log("Finding user id with email " + req.payload.email);
  if (req.payload.email) {
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
        if (user.type != "Admin") {
            sendJSONresponse(res, 404, {'message': 'Restricted Permission!'});
            return;
        }
        callback(req, res, user._id);
      });

  } else {
    sendJSONresponse(res, 404, {
      "message": "User not found!"
    });
    return;
  }
};

/* Get List Types */
module.exports.listTypes = function(req, res) {
    Type.find().exec(function(err, types) {
        if (!types) {
            sendJSONresponse(res, 404, {"message": "nothing"});
            return;
        } else if (err) {
            sendJSONresponse(res, 404, err);
            return;
        }
        sendJSONresponse(res, 200, types);
    });
};

/* Add New Type */
module.exports.createType = function(req, res) {
    getUser(req, res, function(req, res, userid){
        Type.create(req.body, function(err, type) {
            if (err) {
                console.log(err);
                sendJSONresponse(res, 400, err);
            } else {
                console.log(type);
                sendJSONresponse(res, 201, type);
            }
        });
    })
};

/* Update Type */
module.exports.updateType = function(req, res) {
    getUser(req, res, function(req, res, userid){
        if (!req.params.typeid) {
            sendJSONresponse(res, 404, {"message": "missing typeId!"});
            return;
        }
        Type.findById(req.params.typeid).exec(function(err, type){
            if (!type) {
                sendJSONresponse(res, 404, {"message": "typeId not found!"});
                return;
            } else if (err) {
                sendJSONresponse(res, 400, err);
                return;
            }
            if (type.categories.length > req.body.categories.length) {
                sendJSONresponse(res, 405, {'message': 'Do not delete existed category!'});
                return;
            } else {
                type.name = req.body.name;
                type.categories = req.body.categories;
                type.save(function(err, type) {
                    if (err) {
                        sendJSONresponse(res, 404, err);
                    } else {
                        sendJSONresponse(res, 200, type);
                    }
                });      
            }
        });
    });
};