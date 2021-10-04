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
        const itemToBuy = interaction.options.getString('item');
        const amount = parseInt(interaction.options.getNumber('amount')) || 1;
        let currentItem;

    // TODO: #1 Instead of using the item name, push object with item name and quantity to array.

        try {
            currentItem = await itemModel.findOne({ name: itemToBuy });
            if (!currentItem) {
                await interaction.reply(`Item not found.`);
                return;
            }
            const owned = profileData.inventory.findIndex(e => e.name == currentItem.name);
            const exist = owned != -1 || profileData.equipment.includes(currentItem.name);
            if (currentItem.unique && exist) {
                await interaction.reply(`You already own this item.`);
                return;
            } else if (currentItem.unique && amount > 1) {
                await interaction.reply(`You can only buy one ${currentItem.name}.`);
                return;
            } else {
                if (currentItem.price * amount > profileData.dons)
                    return interaction.reply(`You don't have enough dons to buy that.`);
                if (currentItem.price * amount <= profileData.dons) {
                    if (owned !== -1) {
                        profileData.inventory[owned].quantity += amount;
                    } else {
                        profileData.inventory.push({
                            name: currentItem.name,
                            quantity: amount
                        });
                    }
                    profileData.dons -= currentItem.price * amount;
                    profileData.save();
                    await interaction.reply(`You bought ${amount} ${currentItem.name}s for Ɖ${currentItem.price * amount}.`);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}
