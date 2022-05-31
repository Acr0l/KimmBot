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
	}
	catch (err) {
		logger.info(err);
	}
};

const setLanguage = async (guildId, language) => {
	guildLanguages[guildId] = language;
};


/**
 *
 * @param { Object } guild - The guild object.
 * @param { String } key - The key to translate.
 * @param { * } options - The options to pass to the translation.
 * @returns { String } - The translated string.
 */
const iTranslate = (guild, key, options = {}) => {
	return i18next.t(key, {
		lng: guildLanguages[guild.id] || 'en',
		...options,
	});
};

/**
 *
 * @param { Object } guild - The guild object.
 * @param { String } key - The key to translate.
 * @param { * } options - The options to pass to the translation.
 * @returns { String } - The translated string.
 */
const translate = (guild, key, options = {}) => {
	return i18next.t(key, {
		lng: guildLanguages[guild.id] || 'en',
		...options,
	});
};

const getLanguage = (guild) => {
	return guildLanguages[guild.id] || 'en';
};

// TODO: Add a way to get the language map for a specific key
const getLanguageMap = (guild, key, separator = ':') => {
	if (!lang.translations[key]) {throw new Error(`Language key ${key} does not exist.`);}
	const propertiesMap = new Map(),
		text = lang.translations[key];
	for (const langKey of Object.keys(text)) {
		propertiesMap.set(langKey, text[langKey].split(separator));
	}
};
module.exports = {
	loadLanguages,
	setLanguage,
	translate,
	getLanguage,
	getLanguageMap,
	iTranslate,
};
