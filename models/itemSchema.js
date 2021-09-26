const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemID: { type: String, required: true, unique: true },
    name: { type: Number, required: true, default: 0 },
    description: { type: String, required: true, default: '' },
    price: { type: Number, required: true, default: 0 },
    use: { type: Array, required: true, default: [] }
});

const model = mongoose.model('ItemModel', itemSchema);

module.exports = model;
