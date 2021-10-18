const itemModel = require("../models/itemSchema");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { translate } = require("../handlers/language");
const mustache = require("mustache");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`unequip`)
        .setDescription(`Unequip selected item.`),
    /**
     * @param { Message } interaction
     * @param { Object } profileData
     * @param { Client } client
     */
    async execute(interaction, profileData, client) {
        /*
        TODO:
        - Check if item is in inventory
        - Get item from db
        - Add item to equipped items
        */
        let itemAction = interaction.options.getString("item");
        const regex = /equip/;
        const { guild } = interaction;
        try {
            let currentItem = await itemModel.findOne({ name: itemAction });
            if (!currentItem) {
                interaction.reply(translate(guild, "INVALID_ITEM"));
            } else if (profileData.equipment.includes(currentItem.name)) {
                profileData.equipment.splice(
                    profileData.equipment.indexOf(currentItem.name),
                    1
                );
                profileData.inventory.push({
                    name: currentItem.name,
                    quantity: 1,
                });
                profileData.save();
                interaction.reply(
                    mustache.render(
                        translate(guild, "UNEQUIPPED_SUCCESSFULLY"),
                        { item: currentItem.name }
                    )
                );
            } else if (!profileData.equipment.includes(currentItem.name)) {
                interaction.reply(translate(guild, "NOT_EQUIPPED"));
            } else {
                interaction.reply(translate(guild, "ERROR"));
            }
        } catch (err) {
            console.log(err);
            interaction.reply(translate(guild, "ERROR"));
        }
    },
};
