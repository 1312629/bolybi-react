var mongoose = require( 'mongoose' );
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    hash: String,
    salt: String,
    type: {type: String, default: 'User'},
    name: {type: String, required: true},
    avatarURL: {type: String, default: '../../images/avatar_default.png'},
    description: String,
    createdDate: {type: Date, default: Date.now},
    updatedDate: {type: Date, default: Date.now},
    gender: String,
    cart: {type: mongoose.Schema.ObjectId, ref: "Cart"}
});

userSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
};

userSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        _id: this._id,
        email: this.email,
        name: this.name,
        type: this.type,
        avatarURL: this.avatarURL,
        description: this.description,
        gender: this.gender,
        cart: this.cart,
        createdDate: this.createdDate,
        exp: parseInt(expiry.getTime() / 1000)
    }, process.env.JWT_SECRET); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

mongoose.model('User', userSchema);