const { EmbedBuilder } = require('discord.js'),
	{ SlashCommandBuilder } = require('@discordjs/builders'),
	{ translate, iTranslate } = require('../../handlers/language'),
	{ getItem } = require('../../handlers/itemInventory');
const { SECONDARY } = require('../../constants/constants');

const NS = "glossary";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('Display current user items.'),
	async execute(interaction, profileData) {
		const { guild } = interaction;
		const inventory = profileData.inventory;
		let totalItems = 0;
		if (inventory.length === 0) {
			interaction.reply(iTranslate(guild, `${NS}:inventory.embed.description`, { count: 0 }));
			return;
		}
		inventory.forEach((item) => {
			totalItems += item.quantity;
		});
		const inventoryEmbedDescription = iTranslate(guild, `${NS}:inventory.embed.description`, { count: totalItems });
		const inventoryEmbed = new EmbedBuilder()
			.setTitle(
				iTranslate(guild, `${NS}:inventory.embed.title`, { username: interaction.user.username })
			)
			.setColor(SECONDARY)
			.setDescription(inventoryEmbedDescription);
		for (const item of inventory) {
			const itemData = await getItem(item._id);
			inventoryEmbed.addFields([ { name: `${itemData.name} ${item.quantity != 1 ? `\`[${item.quantity}]\`` : ''}`, value: translate(guild, itemData.description) }]);
		}
		interaction.reply({ embeds: [inventoryEmbed] });
	},
};
