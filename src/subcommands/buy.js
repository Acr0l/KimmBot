const { SlashCommandBuilder } = require('@discordjs/builders'),
	{ iTranslate } = require('../handlers/language'),
	{ getItemList } = require('../handlers/itemInventory'),
	logger = require('../logger');

const TRANSLATION_PATH = 'glossary:subcommands.buy';
const REJECTION_PATH = 'glossary:rejection.items';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('buy')
		.setDescription('Buy item from shop.'),
	/**
		 *
		 * @param {import('discord.js').Interaction} interaction
		 * @param {import('../models/profileSchema').User} profileData
		 * @returns
		 */
	async execute(interaction, profileData) {
		// #region Constants
		/**
		 * @type {import('discord.js').Guild | null}
		 */
		const guild = interaction.guild,
			/** @type {String} */
			// @ts-ignore
			itemToBuy = interaction.options.getString('item'),
			// @ts-ignore
			amount = parseInt(interaction.options.getNumber('amount')) || 1,
			itemList = getItemList(),
			currentItem =
                itemList[Object.keys(itemList).filter((item) => itemList[item].name.toLowerCase() === itemToBuy.toLowerCase())];
		// #endregion
		// TODO: #1 Instead of using the item name, use item id.
		try {
			/** @type {Boolean} */
			// @ts-ignore
			const owned = profileData.inventory.some(
				/** @param {{_id: String, quantity: Number}} e */
					(e) => e._id == currentItem?.id,
				),
				equipped = profileData.equipment.includes(currentItem?.id);
			if (!currentItem) throw 'item_not_found';
			else if (currentItem.unique && (amount > 1 || owned || equipped)) throw 'item_unique';
			else if (currentItem.price * amount > profileData.dons) throw 'insufficient_funds';
			// Start buying item
			if (!owned) {
				// @ts-ignore
				profileData.inventory.push({
					_id: currentItem.id,
					quantity: amount,
				});
			} else {
				// @ts-ignore
				profileData.inventory.find(
					/** @param {{_id: String, quantity: Number}} e */
					(e) => e._id == currentItem.id,
				).quantity += amount;
			}
			profileData.dons -= currentItem.price * amount;
			// @ts-ignore
			await profileData.save();
			// @ts-ignore
			await interaction.reply({
				content: iTranslate(guild, `${TRANSLATION_PATH}.success`, { count: amount, currentItem, user: interaction.user }),
			});
		} catch (error) {
			if (typeof error !== 'string') {
				logger.error(error);
				// @ts-ignore
				return interaction.reply({ content: iTranslate(guild, 'error') });
			}
			// @ts-ignore
			return await interaction.reply({ content: iTranslate(guild, `${REJECTION_PATH}.${error}`) });
		}
	},
};
