const logger = require('../logger');

// client.once('ready', async () => {
module.exports = {
    name: 'error',
    once: false,
    async execute(err) {
        logger.error(err);
    }
};