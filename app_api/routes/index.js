var express = require ('express');
var router = express.Router();
var jwt = require('express-jwt'); 
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});
var ctrlItems = require('../controllers/items');
var ctrlUsers = require('../controllers/users');
var ctrlCarts = require('../controllers/carts');
var ctrlOrders = require('../controllers/orders');
var ctrlAuth = require('../controllers/authentication');
var ctrlTypes = require('../controllers/types');
var multer = require('multer');
var crypto = require('crypto');
var path = require('path');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + path.extname(file.originalname));
    });
  }
});
var upload = multer({ storage: storage });

// items
router.get('/items', ctrlItems.itemsList);
router.post('/items', upload.array('imgs'), auth, ctrlItems.itemCreate);
router.get('/items/:itemid', ctrlItems.itemGet);
router.put('/items/:itemid', auth, ctrlItems.itemUpdate);
//router.delete('/items/:itemid', ctrlItems.itemsDeleteOne);

// users
router.get('/users', ctrlUsers.usersList);
router.post('/users', ctrlUsers.userCreate);
router.get('/users/:userid', ctrlUsers.userGet);
router.put('/users/:userid', ctrlUsers.userUpdate);
router.get('/users/login', ctrlUsers.login);

// auth
router.post('/register', upload.array('avatar'), ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// orders
router.get('/orders', auth, ctrlOrders.listOrders);
router.post('/orders', auth, ctrlOrders.orderCreate);
router.get('/orders/:orderid', auth, ctrlOrders.orderGet);
router.put('/orders/:orderid', auth, ctrlOrders.orderUpdate);
router.get('/reportOrders', ctrlOrders.report);

// carts
router.get('/carts', auth, ctrlCarts.getByUser);
router.get('/carts/:cartid', ctrlCarts.cartGet);
router.put('/carts', auth, ctrlCarts.cartUpdate);
//router.post('/carts', auth, ctrlCarts.cartCreate);

// types
router.post('/types', auth, ctrlTypes.createType);
router.get('/types', ctrlTypes.listTypes);
router.put('/types/:typeid', auth, ctrlTypes.updateType);

module.exports = router;
