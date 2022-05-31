const logger = require('../logger');

module.exports = {
	name: 'warn',
	once: true,
	async execute(m) {
		logger.warn(m);
	},
};