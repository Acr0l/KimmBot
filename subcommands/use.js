const { SlashCommandBuilder } = require("@discordjs/builders");
const itemDatabase = require("../models/itemSchema");
const { translate } = require('../handlers/language');

module.exports = {
    data: new SlashCommandBuilder().setName(`use`).setDescription(`Use item.`),
    /**
     * @param { Message } interaction
     * @param { Object } profileData
     * @param { Client } client
     */
    async execute(interaction, profileData, client) {
        const itemAction = interaction.options.getString("item");
        const amount = interaction.options.getNumber("amount") || 1;
        const { guild } = interaction;
        
        try {
            let currentItem = await itemDatabase.findOne({ name: itemAction });
            let ownedIndex = await profileData.inventory.findIndex(
                (item) => item.name === currentItem.name
            );
            if (!currentItem) {
                interaction.reply(translate(guild, "INVALID_ITEM"));
            } else if (ownedIndex === -1) {
                interaction.reply(translate(guild, "UNOWNED_ITEM"));
            } else if (
                currentItem &&
                amount <= profileData.inventory[ownedIndex].quantity &&
                currentItem.iType === 1 //Consumable
            ) {
                const finalAmount =
                    profileData.inventory[ownedIndex].quantity - amount;
                if (finalAmount === 0) {
                    profileData.inventory.splice(ownedIndex, 1);
                } else {
                    profileData.inventory[ownedIndex].quantity = finalAmount;
                }
                await profileData.save();
                const itemUse = require(`../items/${currentItem.funcPath}`);
                if (itemUse) await itemUse.use(interaction, profileData, currentItem, amount);
            } else {
                interaction.reply(translate(guild, "INVALID_ITEM"));
            }
        } catch (err) {
            console.log(err);
            interaction.reply(translate(guild, "INVALID_ITEM"));
        }
    },
};
