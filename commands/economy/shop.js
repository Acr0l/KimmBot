const { SlashCommandBuilder } = require("@discordjs/builders");
const itemModel = require("../../models/itemSchema");
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`shop`)
        .setDescription(`Display available items.`),
    /**
     * @param { Message } interaction
     * @param { Object } profileData
     * @param { Client } client
     */
    async execute(interaction, profileData, client) {
        await interaction.deferReply(`Fetching data.`);
        const items = await itemModel.find({});
        const embed = new MessageEmbed()
            .setTitle(`Shop`)
            .setColor(`#0099ff`)
            .setDescription(`Here are the items available for purchase.`);
        for (const item of items) {
            embed.addField(
                `${item.name}`,
                `${item.description}\nPrice: **Ɖ${item.price}**`
            );
        }
        await interaction.editReply({ embeds: [embed] });
    },
};
