const { SlashCommandBuilder } = require('@discordjs/builders'),
	{ MessageEmbed } = require('discord.js'),
	{ translate } = require('../../handlers/language'),
	mustache = require('mustache');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Check your balance'),
	async execute(interaction, profileData) {
		const { guild } = interaction;
		const embed = new MessageEmbed()
			.setColor('#39A2A5')
			.setTitle(
				mustache.render(translate(guild, 'BALANCE_TITLE'), {
					user: interaction.user.username,
				}),
			)
			.setDescription(
				mustache.render(translate(guild, 'BALANCE_DESCRIPTION'), {
					dons: profileData.dons,
				}),
			);
		interaction.reply({ embeds: [embed] });
	},
};
