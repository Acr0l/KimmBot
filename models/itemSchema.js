const mongoose = require('mongoose');


const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true, default: '' },
    // 0: Equipment , 1: Consumable, 2: Special Consumable
    iType: { type: Number, required: true, default: 1 },
    tier: { type: String, required: true, default: "common" },
    price: { type: Number, required: true, default: 0 },
    use: { type: String, default: '' },
    funcPath: { type: String, default: '' },
    unique: { type: Boolean, default: false }
});

const model = mongoose.model('ItemModel', itemSchema);

module.exports = model;
