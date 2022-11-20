const mongoose = require('mongoose');


const achievementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true, default: '' },
    tier: { type: Number, required: true, default: 0 },
    reward: { type: String, required: true, default: '' },
    image: { type: String, required: true, default: '' }
});

const model = mongoose.model('AchievementModel', achievementSchema);

module.exports = model;
