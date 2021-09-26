const mongoose = require('mongoose');


const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true, default: '' },
    price: { type: Number, required: true, default: 0 },
    use: { type: String, default: '' },
    funcPath: { type: String, default: '' }
});

const model = mongoose.model('ItemModel', itemSchema);

module.exports = model;
