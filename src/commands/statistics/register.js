const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
	{ SlashCommandBuilder } = require('@discordjs/builders'),
	profileModel = require('../../models/profileSchema'),
	{ iTranslate } = require('../../handlers/language'),
	logger = require('../../logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Create your Kimm account.'),
	async execute(interaction) {
		const { guild } = interaction;
		let profileData;

		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setURL('https://sebastianlorca.com')
				.setLabel('Tutorial')
				.setStyle(ButtonStyle.Link)
				.setEmoji('📖'),
		);

		try {
			profileData = await profileModel.findOne({
				userID: interaction.user.id,
			});
			if (!profileData) {
				const profile = await profileModel.create({
					userID: interaction.user.id,
					dons: 0,
				});
				profile.save();
				await interaction.reply({
					content: iTranslate(guild, 'glossary:register.success', { user: interaction.user.username }),
					components: [row],
				});
				return;
			} else {
				await interaction.reply({
					content: iTranslate(guild, 'glossary:register.failure', { user: interaction.user.username }),
					components: [row],
				}
				);
				return;
			}
		} catch (err) {
			logger.info(err);
		}

		const filter = (i) =>
			i.user.id === interaction.user.id && i.customId === 'tutorial';

		const collector = interaction.channel.createMessageComponentCollector({
			filter,
			componentType: 'BUTTON',
			time: 20000,
		});

		collector.on('collect', async (i) => {
			await i.update('WIP');
		});

		collector.on('end', async () => {
			await interaction.editReply('You have finished the tutorial.');
		});
	},
};
