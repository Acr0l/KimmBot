const { MessageEmbed } = require("discord.js"),
    { SlashCommandBuilder } = require("@discordjs/builders"),
    mustache = require("mustache"),
    { translate } = require("../../handlers/language"),
    { getItem } = require("../../handlers/itemInventory");

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
        const { guild } = interaction;
        const inventory = profileData.inventory;
        let itemQuantity = 0;
        if (inventory.length === 0) {
            interaction.reply(translate(guild, "INVENTORY_EMPTY"));
            return;
        }
        inventory.forEach((item) => {
            itemQuantity += item.quantity;
        });
        const n = itemQuantity != 1 ? 0 : 1;
        const itemNum = mustache
            .render(translate(guild, "INVENTORY_QUANTITY"), {
                quantity: itemQuantity,
            })
            .split(":")[n];
        const embed = new MessageEmbed()
            .setTitle(
                mustache.render(translate(guild, "INVENTORY_TITLE"), {
                    user: interaction.user.username,
                })
            )
            .setColor(0x00ae86)
            .setDescription(`${itemNum}.`);
        for (const item of inventory) {
            const itemData = await getItem(item._id);
            embed.addField(`${itemData.name} ${item.quantity != 1 ? `\`[${item.quantity}]\`` : ''}`, translate(guild, itemData.description));
        }
        interaction.reply({ embeds: [embed] });
    },
};
