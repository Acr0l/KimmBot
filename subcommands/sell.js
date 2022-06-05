const { SlashCommandBuilder } = require('@discordjs/builders'),
	{ getItemList } = require('../handlers/itemInventory'),
	{ iTranslate } = require('../handlers/language');

const TRANSLATION_PATH = 'subcommands.sell';
const REJECTION_PATH = 'subcommands.items.rejection';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('sell')
		.setDescription('Sell item to the shop.'),
	async execute(interaction, profileData) {
		// Get guild data -> Guild language
		const { guild } = interaction,
			// Get amount of items to sell
			amount = interaction.options.getNumber('amount') || 1,
			// Get item to sell (String)
			itemToSell = interaction.options.getString('item'),
			// Get list to compare which item to sell
			itemList = getItemList(),
			currentItem = itemList[ Object.keys(itemList).filter((item) => itemList[item].name === itemToSell) ],
			ownedIndex = profileData.inventory.findIndex((item) => item._id === currentItem.id),
			finalAmount = profileData.inventory[ownedIndex].quantity - amount,
			equipped = profileData.equipment.findIndex((item) => item === currentItem.id);
		try {
			if (!currentItem) {throw 'item_not_found';}
			else if (ownedIndex === -1) {throw 'item_not_owned';}
			else if (finalAmount < 0) {throw 'invalid_quantity';}
			else if (equipped !== -1) {throw 'item_equipped';}
			// TODO: Item not available
			if (finalAmount === 0) {profileData.inventory.splice(ownedIndex, 1);}
			else {profileData.inventory[ownedIndex].quantity = finalAmount;}
			// Add cash to user
			profileData.dons += currentItem.price * amount;
			await profileData.save();
			await interaction.reply({ content: iTranslate(guild, `${TRANSLATION_PATH}.success`, { count: amount, currentItem }) });
		}
		catch (error) {
			return await interaction.reply({ content: iTranslate(guild, `${REJECTION_PATH}.${error}`) });
		}
	},
};
