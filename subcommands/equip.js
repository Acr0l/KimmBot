const { SlashCommandBuilder } = require('@discordjs/builders'),
	{ getItemList } = require('../handlers/itemInventory'),
	{ iTranslate } = require('../handlers/language');

const TRANSLATION_PATH = 'subcommands.equip';
const REJECTION_PATH = 'rejection.items';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('equip')
		.setDescription('Equip selected item.'),
	/**
		 *
		 * @param {import('discord.js').Interaction} interaction
		 * @param {import('../models/profileSchema').User} userData
		 * @returns
		 */
	async execute(interaction, userData) {
		const { guild } = interaction,
			// @ts-ignore
			itemAction = interaction.options.getString('item'),
			regex = /equip/;

		try {
			const itemList = getItemList(),
				currentItem = itemList[Object.keys(itemList).filter((item) => itemList[item].name.toLowerCase() === itemAction.toLowerCase())],
				// @ts-ignore
				owned = userData.inventory.findIndex((item) => item._id === currentItem?.id);
			if (!currentItem) {throw 'item_not_found';}
			else if (userData.equipment.includes(currentItem?.id)) {throw 'item_equipped';}
			else if (owned === -1) {throw 'item_not_owned';}
			else if (currentItem && regex.test(currentItem?.use)) {
				// Remove item from inventory
				// @ts-ignore
				userData.inventory.splice(owned, 1);
				// Add item to equipment
				userData.equipment.push(currentItem.id);
				// @ts-ignore
				await userData.save();
				// @ts-ignore
				await interaction.reply({ content: iTranslate(guild, `${TRANSLATION_PATH}.success`, { currentItem }) });
			}
			else {throw 'invalid_action';}
		}
		catch (error) {
			// @ts-ignore
			return await interaction.reply({ content: iTranslate(guild, `${REJECTION_PATH}.${error}`) });
		}
	},
};
