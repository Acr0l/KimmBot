const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const itemModel = require('../../models/itemSchema');
const profile = require('../user/profile');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`buy`)
        .setDescription(`Buy item from shop.`)
        .addStringOption(item => item
                .setName(`item`)
                .setDescription(`Enter the item name.`)
                .setRequired(true)),
  /**
    * @param { Message } interaction
    * @param { Object } profileData
    * @param { Client } client
    */
    async execute(interaction, profileData, client) {
        let itemToBuy = interaction.options.getString('item');
        let currentItem;

        try {
            currentItem = await itemModel.findOne({ name: itemToBuy });
            if (!currentItem) {
                 await interaction.reply(`Item not found.`);
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
        } catch (error) { console.log(error); }
    }
}
