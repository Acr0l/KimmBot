const { SlashCommandBuilder } = require('@discordjs/builders'),
	{ getItemList } = require('../handlers/itemInventory'),
	{ translate } = require('../handlers/language'),
	mustache = require('mustache');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unequip')
		.setDescription('Unequip selected item.'),
	async execute(interaction, profileData) {
		/*
        TODO:
        - Check if item is in inventory
        - Get item from db
        - Add item to equipped items
        */
		const itemAction = interaction.options.getString('item'),
			{ guild } = interaction;
		try {
			const itemList = getItemList(),
				currentItem =
                    itemList[Object.keys(itemList).filter((item) => itemList[item].name.toLowerCase() === itemAction.toLowerCase())
                    ];
			if (!currentItem) {
				interaction.reply(translate(guild, 'INVALID_ITEM'));
			}
			else if (profileData.equipment.includes(currentItem.id)) {
				profileData.equipment.splice(
					profileData.equipment.indexOf(currentItem.id),
					1,
				);
				profileData.inventory.push({
					_id: currentItem.id,
					quantity: 1,
				});
				await profileData.save();
				await interaction.reply(
					mustache.render(
						translate(guild, 'UNEQUIPPED_SUCCESSFULLY'),
						{ item: currentItem.name },
					),
				);
			}
			else if (!profileData.equipment.includes(currentItem.id)) {
				interaction.reply(translate(guild, 'NOT_EQUIPPED'));
			}
			else {
				interaction.reply(translate(guild, 'ERROR'));
			}
		}
		catch (err) {
			console.log(err);
			interaction.reply(translate(guild, 'ERROR'));
		}
	},
};
