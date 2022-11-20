const { SlashCommandBuilder } = require('@discordjs/builders'),
	{ EmbedBuilder } = require('discord.js'),
	{ translate } = require('../../handlers/language'),
	mustache = require('mustache');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Shows the user specific stats in different subjects.'),
	async execute(interaction, profileData) {
		const { guild } = interaction;

		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle(`${translate(guild, 'STATS_TITLE')}`)
			.setDescription(`${translate(guild, 'STATS_DESCRIPTION')}`)
			.addFields(
				profileData.stats.sort((a, b) => a.tier - b.tier).map(stat => {
					return {
						name: stat.subject,
						value: mustache.render(
							translate(guild, 'STATS_FIELD_DATA'),
							{
								tier: stat.tier,
								accuracy: stat.accuracy,
								totalAnswered: stat.totalAns,
							},
						),
					};
				}),
			);
		interaction.reply({ embeds: [embed] });
	},
};
