const itemModel = require("../models/itemSchema");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`equip`)
        .setDescription(`Equip selected item.`),
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

        try {
            let currentItem = await itemModel.findOne({ name: itemAction });
            let owned = profileData.inventory.findIndex(
                (item) => item.name === currentItem.name
            );
            if (!currentItem) {
                interaction.reply("Item does not exist.");
            } else if (profileData.equipment.includes(currentItem.name)) {
                interaction.reply("You already have that item equipped.");
            } else if (owned === -1) {
                interaction.reply("You don't have that item!");
            } else if (currentItem && regex.test(currentItem.use)) {
                profileData.equipment.push(currentItem.name);
                profileData.inventory.splice(owned, 1);
                profileData.save();
                interaction.reply(`You equipped a ${currentItem.name}!`);
            } else {
                interaction.reply("Item cannot be equipped.");
            }
        } catch (err) {
            console.log(err);
            interaction.reply("Item does not exist.");
        }
    },
};
