const { SlashCommandBuilder } = require('@discordjs/builders');
const { languages } = require('../../resources/lang.json');
const langModel = require('../../models/languageSchema');
const { setLanguage } = require('../../handlers/language');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`setlang`)
        .setDescription(`Set the server's language.`)
        .addStringOption(lang =>
                lang.setName(`lang`)
                    .setDescription(`The language to set.`)
                    .setRequired(true)
                    .addChoice(`English`, `en`)
                    .addChoice(`Español`, 'es')
                ),
  /**
    * @param { Object } interaction - Object with the interaction data sent by the user.
    * @param { Object } profileData - Object from the database with the user profile data.
    * @param { Object } client - The discord.js client object.
    */
    async execute(interaction, profileData, client) {
        const language = interaction.options.getString('lang');
        const { guild } = interaction;

        if (!languages.includes(language)) {
            return interaction.reply(`${language} is not a valid language.`);
        }
        setLanguage(guild, language);
        let guildLang;
        try {
            guildLang = await langModel.findOneAndUpdate({
                _id: guild.id,
            }, {
                _id: guild.id,
                language: language,
            }, {
                upsert: true
            });

            return interaction.reply(`Language set to ${language}.`);
        }
        catch (err) {
            return interaction.reply(`An error occured while setting the language.`);
        }
    }
}
