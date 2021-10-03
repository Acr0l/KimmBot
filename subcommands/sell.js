const itemModel = require('../models/itemSchema');
const { SlashCommandBuilder } = require('@discordjs/builders');

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
        let itemToSell = interaction.options.getString('item');
        let owned = profileData.inventory.findIndex(item => item.name === itemToSell);
        if (owned != -1) {
            itemModel.findOne({ name: itemToSell }, (err, item) => {
                if (err) {
                    interaction.reply('An error occurred while trying to sell item.');
                } else if (item) {
                    profileData.dons += item.price;
                    profileData.inventory.splice(owned, 1);
                    profileData.save();
                    interaction.reply(`You sold ${itemToSell} for ${item.price} dons.`);
                }
            });
        } else {
            interaction.reply('You do not have this item in your inventory.');
        }
    }
}
