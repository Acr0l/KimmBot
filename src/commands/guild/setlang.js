const { SlashCommandBuilder } = require('@discordjs/builders');
const { languages } = require('../../resources/lang.json');
const langModel = require('../../models/languageSchema');
const { setLanguage, iTranslate } = require('../../handlers/language');

const TRANSLATION_PATH = 'setlang';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setlang')
		.setDescription('Set the server\'s language.')
		.addStringOption((lang) =>
			lang
				.setName('language')
				.setDescription('The language to set.')
				.setRequired(true)
				.addChoices(
					{ name: 'English', value: 'en' },
					{ name: 'Español', value: 'es' },
				),
		),
	async execute(interaction) {
		const language = interaction.options.getString('lang');
		const { guild } = interaction;

		if (!languages.includes(language)) {
			return interaction.reply({
				content: `\`${language}\` is not a valid language.`,
			});
		}
		setLanguage(guild.id, language);
		try {
			await langModel.findOneAndUpdate(
				{
					_id: guild.id,
				},
				{
					_id: guild.id,
					language: language,
				},
				{
					upsert: true,
				},
			);

			return interaction.reply({ content: iTranslate(guild, `${TRANSLATION_PATH}.set`) });
		} catch (err) {
			return interaction.reply({
				content:
				'An error occurred while setting the language.',
			});
		}
	},
};
