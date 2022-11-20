const langModel = require('../models/languageSchema'),
	lang = require('../resources/lang.json'),
	logger = require('../logger'),
	i18next = require('i18next');

const guildLanguages = {};

const loadLanguages = async (client) => {
	try {
		for (const guild of client.guilds.cache) {
			const [guildId] = guild;

			const result = await langModel.findOne({ _id: guildId });

			guildLanguages[guildId] = result ? result.language : 'en';
		}
	} catch (err) {
		logger.error(err);
	}
};

const setLanguage = async (guildId, language) => {
	guildLanguages[guildId] = language;
};

/**
 * Function that allows the bot to communicate with i18next.
 * @param { import('discord.js').Guild | null } guild Guild to get the language for
 * @param { String | String[] } key Key withing the language map
 * @param {*} [options] Options to pass to the language map
 * @returns {String|Object} Translated string or object
 */
const iTranslate = (guild, key, options = {}) => {
	const language = guildLanguages[guild?.id] || 'en';
	return i18next.t(key, {
		lng: language,
		...options,
	});
};

const translate = (guild, textKey) => {
	if (!lang.translations[textKey]) {
		throw new Error(`Language key ${textKey} does not exist.`);
	}

	return lang.translations[textKey][guildLanguages[guild.id] || 'en'];
};
const getLanguage = (guild) => {
	return guildLanguages[guild.id] || 'en';
};
module.exports = {
	loadLanguages,
	setLanguage,
	translate,
	getLanguage,
	iTranslate,
};
