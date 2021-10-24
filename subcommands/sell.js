const { SlashCommandBuilder } = require('@discordjs/builders'),
    { getItemList } = require('../handlers/itemInventory'),
    { translate } = require('../handlers/language');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`sell`)
        .setDescription(`Sell item to the shop.`),
    /**
     * @param { Message } interaction
     * @param { Object } profileData
     * @param { Client } client
     */
    async execute(interaction, profileData, client) {
        const { guild } = interaction,
            amount = interaction.options.getNumber('amount') || 1,
            itemToSell = interaction.options.getString('item'),
            itemList = getItemList(),
            currentItem =
                itemList[
                    Object.keys(itemList).filter(
                        (item) => itemList[item].name === itemToSell,
                    )
                ],
            ownedIndex = profileData.inventory.findIndex(
                (item) => item.id === currentItem.id,
            ),
            finalAmount =
                profileData.inventory[ownedIndex].quantity - amount;
        if (!currentItem) {
            interaction.reply(translate(guild, 'INVALID_ITEM'));
        } else if (ownedIndex === -1) {
            interaction.reply(translate(guild, 'UNOWNED_ITEM'));
        } else if (finalAmount < 0) {
            interaction.reply(translate(guild, 'INVALID_AMOUNT'));
        } else {
            profileData.dons += item.price * amount;
            if (finalAmount === 0) {
                profileData.inventory.splice(ownedIndex, 1);
            } else {
                profileData.inventory[ownedIndex].quantity = finalAmount;
            }
            await profileData.save();
            await interaction.reply(translate(guild, 'SELL_SUCCESS', { amount, item: currentItem.name, price: item.price }));
        }
    },
};
