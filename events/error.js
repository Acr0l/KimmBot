const logger = require('../logger');

module.exports = {
	name: 'error',
	once: false,
	async execute(err) {
		logger.error(err);
	},
};