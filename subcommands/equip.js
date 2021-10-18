const itemModel = require('../models/itemSchema'),
    { SlashCommandBuilder } = require('@discordjs/builders'),
    { getItemList } = require('../handlers/itemInventory'),
    { checkItemInfo } = require('../util/userfuncs'),
    { translate } = require('../handlers/language'),
    mustache = require('mustache');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`equip`)
        .setDescription(`Equip selected item.`),
    /**
     * @param { Message } interaction
     * @param { Object } profileData
     */
    async execute(interaction, profileData) {
        const { guild } = interaction,
            itemAction = interaction.options.getString('item'),
            regex = /equip/;

        try {
            let currentItem = checkItemInfo(await getItemList(), itemAction);
            let owned = profileData.inventory.findIndex(
                (item) => item.id === currentItem.id,
            );
            if (!currentItem) {
                interaction.reply(translate(guild, 'INVALID_ITEM'));
            } else if (profileData.equipment.includes(currentItem.id)) {
                interaction.reply(translate(guild, 'EQUIP_ALREADY_EQUIPPED'));
            } else if (owned === -1) {
                interaction.reply(translate(guild, 'UNOWNED_ITEM'));
            } else if (currentItem && regex.test(currentItem.use)) {
                profileData.equipment.push(currentItem.id);
                profileData.inventory.splice(owned, 1);
                profileData.save();
                interaction.reply(mustache.render(translate(guild, 'EQUIP_SUCCESS'), { item: currentItem.name }));
            } else {
                interaction.reply(translate(guild, 'INVALID_ITEM'));
            }
        } catch (err) {
            console.log(err);
            interaction.reply(translate(guild, 'ERROR'));
        }
    },
};
