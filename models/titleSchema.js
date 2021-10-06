const mongoose = require('mongoose');


const titleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true, default: '' },
    tier: { type: Number, required: true, default: 0 }
});

const model = mongoose.model('TitleModel', titleSchema);

module.exports = model;
