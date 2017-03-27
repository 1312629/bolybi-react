var mongoose = require ( 'mongoose' );

var orderDetailSchema = new mongoose.Schema({
    item: {type: mongoose.Schema.ObjectId, ref: 'Item'},
    size: {type: String, required: true},
    quantity: {type: Number, required: true, min: 0},
    price: {type: Number, required: true, min: 0},
    discount: {type: Number, default: 0, min: 0},
    total: {type: Number, default: 0, min: 0}
});

var orderSchema = new mongoose.Schema({
    owner: {type: mongoose.Schema.ObjectId, ref: "User"},
    receiver: {type: String, required: true},
    address: String,
    phone: String,
    createdDate: {type: Date, default: Date.now},
    updatedDate: {type: Date, default: Date.now},
    status: {type: String, default: 'New'},
    note: String,
    total: {type: Number, required: true, min: 0},
    orderDetails: [orderDetailSchema]
});

mongoose.model('Order', orderSchema);