const { SlashCommandBuilder } = require('@discordjs/builders');
const itemModel = require('../models/itemSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`buy`)
        .setDescription(`Buy item from shop.`),
  /**
    * @param { Message } interaction
    * @param { Object } profileData
    * @param { Client } client
    */
    async execute(interaction, profileData, client) {
        let itemToBuy = interaction.options.getString('item');
        let currentItem;

        // TODO: #1 Instead of using the item name, push object with item name and quantity to array.

        try {
            currentItem = await itemModel.findOne({ name: itemToBuy });
            if (!currentItem) {
                 await interaction.reply(`Item not found.`);
                return;
            } else if (currentItem.unique && profileData.inventory.includes(currentItem.name)) {
                await interaction.reply(`You already own this item.`);
                return;
            } else {
                if (currentItem.price > profileData.dons) 
                    return interaction.reply(`You don't have enough dons to buy this item.`);
                if (currentItem.price <= profileData.dons) {
                    profileData.dons -= currentItem.price;
                    profileData.inventory.push(currentItem.name);
                    profileData.save();
                    await interaction.reply(`You bought ${currentItem.name} for ${currentItem.price} dons.`);
                }
            }
        } catch (error) { 
            console.log(error); 
        }
    }
}
