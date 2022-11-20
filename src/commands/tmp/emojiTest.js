const { SlashCommandBuilder } = require('@discordjs/builders');

const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('name')
		.setDescription('Just testing if the emoji is working'),
	/**
    * @param { Object } interaction - Object with the interaction data sent by the user.
    * @param { Object } profileData - Object from the database with the user profile data.
    * @param { Object } client - The discord.js client object.
    */
	async execute(interaction) {
		const emoji = '<:HintUsed:905990062095867935>';
		const embed = new MessageEmbed()
			.setTitle('Emoji Test')
			.setDescription('This is a test of the emoji ' + emoji)
			.setColor('#00ff00')
			.setFooter({ text: 'Emoji Test' })
			.setTimestamp();

		await interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
