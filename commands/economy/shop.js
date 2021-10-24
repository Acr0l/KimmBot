const { SlashCommandBuilder } = require('@discordjs/builders'),
    itemModel = require('../../models/itemSchema'),
    { MessageEmbed } = require('discord.js'),
    { getItemList } = require('../../handlers/itemInventory'),
    { translate } = require('../../handlers/language'),
    mustache = require('mustache');

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
        await interaction.deferReply();
        const items = getItemList(),
            sortedKeys = Object.keys(items).sort(
                (a, b) => items[a].price - items[b].price,
            ),
            embed = new MessageEmbed()
                .setTitle(translate(guild, 'SHOP_TITLE'))
                .setColor(`#0099ff`)
                .setDescription(translate(guild, 'SHOP_DESCRIPTION'))
                .setFields(
                    sortedKeys.map((item) => {
                        return {
                            name: `${items[item].name} (**Ɖ${items[item].price}**)`,
                            value: translate(guild, items[item].description),
                        };
                    }),
                );
        await interaction.editReply({ embeds: [embed] });
    },
};
