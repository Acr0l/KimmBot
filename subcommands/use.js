const { SlashCommandBuilder } = require("@discordjs/builders");
const itemDatabase = require("../models/itemSchema");

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
        
        try {
            let currentItem = await itemDatabase.findOne({ name: itemAction });
            let ownedIndex = await profileData.inventory.findIndex(
                (item) => item.name === currentItem.name
            );
            console.log(profileData.inventory[ownedIndex])
            if (!currentItem) {
                interaction.reply("Item does not exist.");
            } else if (ownedIndex === -1) {
                interaction.reply("You don't have that item!");
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
                const itemUse = require(`../items/${currentItem.funcPath}`);
                if (itemUse) await itemUse.use(interaction, profileData, currentItem, amount);
                profileData.save();
                interaction.reply(`You equipped a ${currentItem.name}!`);
            } else {
                interaction.reply("Item cannot be used.");
            }
        } catch (err) {
            console.log(err);
            interaction.reply("Item does not exist.");
        }
        // await interaction.reply({
        //     content: `This command is not yet implemented.`,
        //     ephemeral: true,
        // });
    },
};
