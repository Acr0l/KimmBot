const mongoose = require('mongoose');

const langsModel = new mongoose.Schema({
	_id: { type: String, required: true },
	language: { type: String, required: true },
});

const model = mongoose.model('Languages', langsModel);

module.exports = model;
