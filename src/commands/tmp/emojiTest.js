const { SlashCommandBuilder } = require('@discordjs/builders');

const { EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('name')
		.setDescription('Just testing if the emoji is working'),
	/**
    * @param { Object } interaction - Object with the interaction data sent by the user.
    */
	async execute(interaction) {
		const emoji = '<:HintUsed:905990062095867935>';
		const embed = new EmbedBuilder()
			.setTitle('Emoji Test')
			.setDescription('This is a test of the emoji ' + emoji)
			.setColor('#00ff00')
			.setFooter({ text: 'Emoji Test' })
			.setTimestamp();

		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
