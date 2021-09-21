const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    level: { type: Number, default: 0 },
    experience: { type: Number, required: true, default: 0 },
    tier: { type: Number, required: true, default: 0 },
    dons: { type: Number, required: true, default: 0 },
    items: { type: Array, required: true, default: [] },
    cooldowns: { type: Array, required: true, default: [] },
    title: { type: String, required: true, default: 'No Title' },
    stats: { type: Array, required: true, default: [] }
});

const model = mongoose.model('ProfileModel', profileSchema);

module.exports = model;