const { SlashCommandBuilder } = require("@discordjs/builders"),
    itemModel = require("../../models/itemSchema"),
    { MessageEmbed } = require("discord.js"),
    { getItemList } = require("../../handlers/itemInventory"),
    { translate } = require("../../handlers/language"),
    mustache = require("mustache");

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
        const { guild } = interaction;
        await interaction.deferReply(translate(guild, "WAIT_FOR_REPLY"));
        const items = await getItemList(),
        embed = new MessageEmbed()
            .setTitle(translate(guild, "SHOP_TITLE"))
            .setColor(`#0099ff`)
            .setDescription(translate(guild, "SHOP_DESCRIPTION"))
            .setFields(
                Object.keys(items).map(item => {
                    return {
                        name: `${items[item].name} (**Ɖ${items[item].price}**)`,
                        value: translate(guild, items[item].description)
                    }
                })
            )
        await interaction.editReply({ embeds: [embed] });
    },
};
