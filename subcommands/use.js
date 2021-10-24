const { SlashCommandBuilder } = require('@discordjs/builders'),
    { translate } = require('../handlers/language'),
    { getItemList } = require('../handlers/itemInventory');

module.exports = {
    data: new SlashCommandBuilder().setName(`use`).setDescription(`Use item.`),
    /**
     * @param { Message } interaction
     * @param { Object } profileData
     * @param { Client } client
     */
    async execute(interaction, profileData, client) {
        const itemAction = interaction.options.getString('item').toLowerCase(),
            amount = interaction.options.getNumber('amount') || 1,
            { guild } = interaction,
            itemList = getItemList(),
            currentItem =
                itemList[
                    Object.keys(itemList).filter(
                        (item) => itemList[item].name.toLowerCase() === itemAction,
                    )
                ];
        if (!currentItem) {
            interaction.reply(translate(guild, 'INVALID_ITEM'));
            return;
        }
        let ownedIndex = profileData.inventory.findIndex(
            (item) => item.id == currentItem.id,
        );
        if (ownedIndex === -1) {
            interaction.reply(translate(guild, 'UNOWNED_ITEM'));
        } else if (
            currentItem &&
            amount <= profileData.inventory[ownedIndex].quantity &&
            currentItem.type === 1 || // Consumable
            currentItem.type === 2 // Special consumable
        ) {
            const finalAmount =
                profileData.inventory[ownedIndex].quantity - amount;
            if (finalAmount === 0) {
                profileData.inventory.splice(ownedIndex, 1);
            } else {
                profileData.inventory[ownedIndex].quantity = finalAmount;
            }
            await profileData.save();
            const itemUse = require(`../items/${currentItem.path}`);
            if (itemUse)
                await itemUse.use(
                    interaction,
                    profileData,
                    currentItem,
                    amount,
                );
        } else {
            interaction.reply(translate(guild, 'INVALID_ITEM'));
        }
    },
};
