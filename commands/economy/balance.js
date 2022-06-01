const { SlashCommandBuilder } = require('@discordjs/builders'),
	{ MessageEmbed } = require('discord.js'),
	{ iTranslate } = require('../../handlers/language');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Check your balance'),
	async execute(interaction, userData) {
		const { guild } = interaction;
		const { title, description, footer } = iTranslate(guild, 'economy.balance', {
			user: {
				username: interaction.user.username,
				balance: userData.dons,
			},
			returnObjects: true,
		});
		const embed = new MessageEmbed()
			.setColor('#39A2A5')
			.setTitle(title)
			.setDescription(description)
			.setFooter({ text: footer });
		interaction.reply({ embeds: [embed] });
	},
};
