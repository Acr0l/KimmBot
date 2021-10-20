const mongoose = require('mongoose');


const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true, default: '' },
    // 0: Equipment , 1: Consumable, 2: Special Consumable
    iType: { type: Number, required: true, default: 1 },
    // 0: Common, 1: Uncommon, 2: Rare, 3: Epic, 4: Legendary, 5: Mythic, 6: Artifact, 7: Relic
    tier: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true, default: 0 },
    use: { type: String, default: '' },
    funcPath: { type: String, default: '' },
    unique: { type: Boolean, default: false }
});

const model = mongoose.model('ItemModel', itemSchema);

module.exports = model;
