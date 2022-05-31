const { loadLanguages } = require('../handlers/language'),
	{ loadDifficulties } = require('../handlers/difficulty'),
	{ loadItems } = require('../handlers/itemInventory'),
	logger = require('../logger');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		logger.info(`Ready! Logged in as ${client.user.tag}`);

		// Load saved languages
		loadLanguages(client);
		// Load saved difficulties
		loadDifficulties(client);
		// Load saved items
		loadItems();

		client.user.setActivity('anime (educational purposes).', {
			type: 'WATCHING',
		});
	},
};
