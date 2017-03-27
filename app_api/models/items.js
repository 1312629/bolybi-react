var mongoose = require ( 'mongoose' );

var itemMetaSchema = new mongoose.Schema({
    metaKey: {type: String, required: true},
    metaValue: {type: String, required: true}
});

var itemDetailSchema = new mongoose.Schema({
    size: {type: String, required: true},
    quantity: {type: Number, required: true, min: 0}
});

var itemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    brand: String,
    color: {type: String, required: true},
    description: String,
    createdDate: {type: Date, default: Date.now},
    updatedDate: {type: Date, default: Date.now},
    category: {type: String, required: true},
    gender: {type: String, default: "Both"},
    type: {type: String, required: true},
    itemMetas:[itemMetaSchema],
    price: {type: Number, required: true, min: 0},
    discount: {type: Number, default: 0, min: 0},
    itemDetails: [itemDetailSchema]
});

mongoose.model('Item', itemSchema);