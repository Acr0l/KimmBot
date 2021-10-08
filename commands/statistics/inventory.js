const { MessageEmbed } = require('discord.js');
const itemModel = require('../../models/itemSchema');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`inventory`)
        .setDescription(`Display current user items.`),
  /**
    * @param { Message } interaction
    * @param { Object } profileData
    * @param { Client } client
    */
    async execute(interaction, profileData, client) {
        const inventory = profileData.inventory;
        let itemQuantity = 0;
        if (inventory.length === 0) {
            interaction.reply(`You have no items.`);
            return;
        }
        inventory.forEach(item => {
            itemQuantity += item.quantity;
        });
        const itemNum = itemQuantity != 1 ? `${itemQuantity} items` : `1 item`;
        const embed = new MessageEmbed()
            .setTitle(`${interaction.user.username}'s Inventory`)
            .setColor(0x00AE86)
            .setDescription(`${itemNum}.`);
        for (const item of inventory) {
            const itemData = await itemModel.findOne({ name: item.name });
            embed.addField(itemData.name, itemData.description);
        }
        interaction.reply({ embeds: [embed] });
    }
}
