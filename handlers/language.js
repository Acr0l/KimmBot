const langModel = require('../models/languageSchema');
const lang = require('../resources/lang.json');

const guildLanguages = {};

const loadLanguages = async (client) => {
    try {
        for (const guild of client.guilds.cache) {
            const [ guildId ] = guild.id;

            const result = await langModel.findOne({ _id: guildId });

            guildLanguages[guildId] = result ? result.language : 'en';
        }
    }
    catch (err) {
        console.log(err);
    }
};

const setLanguage = async (guildId, language) => {
    guildLanguages[guildId] = language;
}

module.exports = (guild, textKey) => {
    if (!lang.translations[textKey]) {
        throw new Error(`Language key ${textKey} does not exist.`);
    }

    const selectedLanguage = guildLanguages[guild.id] || 'en';

    return lang.translations[textKey][selectedLanguage];
};
module.exports = { loadLanguages, setLanguage };