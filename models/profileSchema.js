/**
 * The schema for the users stored in the database
 * @module profileSchema
 * */
const mongoose = require('mongoose');
'use strict';
/**
 * @class effectsData
 * @memberof module:profileSchema~Profile
 * @property {string} name
 * @property {Number} meBoost
 * @property {Number} mrBoost
 * @property {Number} duration
 * @property {Date} durationEnd
 */
const effectsData = new mongoose.Schema({
		name: { type: String, required: true },
		meBoost: { type: Number, default: 0 },
		mrBoost: { type: Number, default: 0 },
		duration: { type: Number, default: 0, required: true },
		durationEnd: {
			type: Date,
			required: true,
			default: Date.now,
		},
	}),
	/**
	 * @class statsSchema
	 * @memberof module:profileSchema~Profile
	 * @property {String} subject
	 * @property {Number} value
	 * @property {Number} correct
	 * @property {Number} incorrect
	 */
	statsSchema = new mongoose.Schema({
		subject: { type: String, required: true },
		tier: { type: Number, required: true },
		correct: { type: Number, default: 0, required: true },
		incorrect: { type: Number, default: 0, required: true },
	}),
	/**
	 * @class inventorySchema
	 * @memberof module:profileSchema~Profile
	 */
	inventorySchema = new mongoose.Schema({
		_id: { type: String, required: true },
		quantity: { type: Number, default: 0, required: true },
	}),
	/**
	 * @constructor Profile
	 * @mixes mongoose.Schema
	 * @property {string} userID
	 * @property {Number} level
	 * @property {Number} xp
	 * @property {Number} totalXp
	 * @property {Number} tier
	 * @property {Number} dons
	 * @property {inventorySchema} inventory
	 * @property {*} cooldowns
	 * @property {string[]} title
	 * @property {{me: Number, totalMe: Number, mr: Number, lastRecovery: Date}} mentalEnergy
	 * @property {statsSchema} stats
	 * @property {string[]} equipment
	 * @property {effectsData} effects
	 * @property {Date} createdAt
	 * @property {Date} updatedAt
	 */
	profileSchema = new mongoose.Schema({
		userID: { type: String, required: true, unique: true },
		level: { type: Number, default: 0 },
		xp: { type: Number, required: true, default: 0 },
		totalXp: { type: Number, required: true, default: 0 },
		tier: { type: Number, required: true, default: 0 },
		dons: { type: Number, required: true, default: 0 },
		inventory: { type: [inventorySchema], required: true, default: [] },
		cooldowns: {
			type: Map,
			of: Date,
			required: true,
			default: new Map(),
		},
		title: { type: [ String ], required: true, default: ['No Title'] },
		// 0 = ME 1 = MR
		// ME = Mental Energy, MR = Mental Recovery
		mentalEnergy: {
			me: { type: Number, required: true, default: 100 },
			totalMe: { type: Number, required: true, default: 100 },
			mr: { type: Number, required: true, default: 1 },
			lastRecovery: { type: Date, required: true, default: Date.now },
		},
		// Stats = Subjects { subject: String, level: Number }
		stats: { type: [statsSchema], required: true, default: [] },
		equipment: { type: [ String ], required: true, default: [] },
		effects: { type: [effectsData], required: true, default: [] },
	});

statsSchema.virtual('totalAns').get(function() {
	return this.correct + this.incorrect;
});

statsSchema.virtual('accuracy').get(function() {
	return ((this.correct / this.totalAns) * 100).toFixed(2);
});

effectsData
	.virtual('durationLeft')
	.get(function() {
		return (this.durationEnd - Date.now()) / 1000;
	})
	.set(function(value) {
		this.durationEnd = Date.now() + value * 1000;
	});

profileSchema.virtual('currentME').get(function() {
	return (
		this.mentalEnergy.totalMe +
        this.effects.map((effect) => effect.meBoost).reduce((a, b) => a + b, 0)
	);
});

profileSchema.virtual('currentMR').get(function() {
	return (
		this.mentalEnergy.mr +
        this.effects.map((effect) => effect.mrBoost).reduce((a, b) => a + b, 0)
	);
});

const Profile = mongoose.model('Profiles', profileSchema);

module.exports = Profile;
