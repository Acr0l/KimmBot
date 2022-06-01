const { SlashCommandBuilder } = require('@discordjs/builders');
const { iTranslate } = require('../../handlers/language');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('item')
		.setDescription('Interaction with items.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('buy')
				.setDescription('Buy an item from the shop.')
				.addStringOption((item) =>
					item
						.setName('item')
						.setDescription('The item to buy.')
						.setRequired(true),
				)
				.addNumberOption((amount) =>
					amount
						.setName('amount')
						.setDescription('The amount of the item to buy.'),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('sell')
				.setDescription('Sell an item to the shop.')
				.addStringOption((item) =>
					item
						.setName('item')
						.setDescription('The item to sell.')
						.setRequired(true),
				)
				.addNumberOption((amount) =>
					amount
						.setName('amount')
						.setDescription('The amount of the item to sell.'),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('equip')
				.setDescription('Equip an item.')
				.addStringOption((item) =>
					item
						.setName('item')
						.setDescription('The item to equip.')
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('unequip')
				.setDescription('Unequip an item.')
				.addStringOption((item) =>
					item
						.setName('item')
						.setDescription('The item to unequip.')
						.setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('use')
				.setDescription('Use an item.')
				.addStringOption((item) =>
					item
						.setName('item')
						.setDescription('The item to use.')
						.setRequired(true),
				)
				.addNumberOption((amount) =>
					amount
						.setName('amount')
						.setDescription('The amount of the item to use.')
						.setRequired(false),
				),
		),

	/**
     * @param { Message } interaction - The message that triggered the command.
     * @param { Object } profileData - The profile data of the user.
     * @param { Client } client - The client instance.
     */
	async execute(interaction, profileData, client) {
		const { guild } = interaction;
		const subcommand = client.subcommands.get(
			interaction.options.getSubcommand(),
		);
		if (!subcommand) {
			return interaction.reply({ content: iTranslate(guild, 'error') });
		}
		try {
			await subcommand.execute(interaction, profileData, client);
		}
		catch (error) {
			await interaction.reply({ content: iTranslate(guild, 'error'), ephemeral: true });
			console.error(error);
		}
	},
};
