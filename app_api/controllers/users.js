var mongoose = require( 'mongoose' );
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

/* Get List Users */
module.exports.usersList = function(req, res) {
    User.find().select('email name gender createdDate avatarURL').exec(function(err, users) {
        if (!users) {
            sendJSONresponse(res, 404, {"message": "nothing"});
            return;
        } else if (err) {
            sendJSONresponse(res, 404, err);
            return;
        }
        sendJSONresponse(res, 200, users);
    });
};

/* Get 1 User */
module.exports.userGet = function(req, res) {
    if (!req.params.userid) {
        sendJSONresponse(res, 404, {"message": "missing userId!"});
        return;
    }
    User.findById(req.params.userid).select('email name gender avatarURL').exec(function(err, user){
        if (!user) {
            sendJSONresponse(res, 404, {"message": "userId not found!"});
            return;
        } else if (err) {
            sendJSONresponse(res, 400, err);
            return;
        }
        sendJSONresponse(res, 200, user);
    });
};

/* Login */
module.exports.login = function(req, res) {
    User.findOne({email: req.query.email}).exec(function(err, use) {
        if (!user) {
            sendJSONresponse(res, 403, {"message": "Email does not existed!"});
            return;
        } else if (err) {
            sendJSONresponse(res, 404, err);
            return;
        }
        if (user.password == req.query.password) {
            sendJSONresponse(res, 200, user);
            return;
        } else {
            sendJSONresponse(res, 402, {"message": "Wrong Password!"});
            return;
        }
    });
};

/* Add New User */
module.exports.userCreate = function(req, res) {
    User.create(req.body, function(err, user) {
        if (err) {
            console.log(err);
            sendJSONresponse(res, 400, err);
        } else {
            console.log(user);
            sendJSONresponse(res, 201, user);
        }
    });
};

/* Update User */
module.exports.userUpdate = function(req, res) {
    if (!req.params.userid) {
        sendJSONresponse(res, 404, {"message": "missing userId!"});
        return;
    }
    User.findById(req.params.userid).exec(function(err, user){
        if (!user) {
            sendJSONresponse(res, 404, {"message": "userId not found!"});
            return;
        } else if (err) {
            sendJSONresponse(res, 400, err);
            return;
        }
        user.password = req.body.password;
        user.type = req.body.type;
        user.updatedDate = new Date();
        user.name = req.body.name;
        user.description = req.body.description;
        user.gender = req.body.gender;
        user.save(function(err, user) {
            if (err) {
                sendJSONresponse(res, 404, err);
            } else {
                sendJSONresponse(res, 200, user);
            }
        });
    });
};