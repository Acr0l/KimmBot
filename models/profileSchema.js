const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    level: { type: Number, default: 0 },
    xp: { type: Number, required: true, default: 0 },
    totalXp: { type: Number, required: true, default: 0 },
    tier: { type: Number, required: true, default: 0 },
    dons: { type: Number, required: true, default: 0 },
    inventory: { type: Array, required: true, default: [] },
    cooldowns: { type: Array, required: true, default: [] },
    title: { type: Array, required: true, default: ['No Title'] },
    // 0 = ME 1 = MR
    // ME = Mental Energy, MR = Mental Recovery
    mentalEnergy: {
        me: { type: Number, required: true, default: 100 },
        totalMe: { type: Number, required: true, default: 100 },
        mr: { type: Number, required: true, default: 1 }
    },
    stats: { type: Array, required: true, default: [] },
    // Areas = Subjects { subject: String, level: Number }
    areas: { type: Array, required: true, default: [] }
});

const model = mongoose.model('ProfileModel', profileSchema);

module.exports = model;
