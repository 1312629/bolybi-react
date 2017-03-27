var mongoose = require ( 'mongoose' );

var typeSchema = new mongoose.Schema({
    name: {type: String, required: true},
    createdDate: {type: Date, default: Date.now},
    description: String,
    categories: [String]
});

mongoose.model('Type', typeSchema);