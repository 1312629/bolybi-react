var mongoose = require ( 'mongoose' );

var cartDetailSchema = new mongoose.Schema({
    item: {type: mongoose.Schema.ObjectId, ref: 'Item'},
    size: {type: String, required: true},
    quantity: {type: Number, required: true, min: 0},
    total: {type: Number, default: 0, min: 0},
});

var cartSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.ObjectId, ref: "User"},
    total: {type: Number, default: 0, min: 0},
    cartDetails: [cartDetailSchema]
});

mongoose.model('Cart', cartSchema);