const { MessageEmbed } = require('discord.js');

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
        const inventory = profileData.items;
        const embed = new MessageEmbed()
            .setTitle(`${interaction.member.nickname}'s Inventory`)
            .setColor(0x00AE86)
            .setDescription(`${inventory.length} items.`);
        for (const item of inventory) {
            embed.addField(item.name, item.description);
        }
        interaction.reply({ embeds: [embed] });
    }
}
