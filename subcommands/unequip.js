const itemModel = require('../models/itemSchema');
const { SlashCommandBuilder } = require('@discordjs/builders');

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
        let itemAction = interaction.options.getString('item');
        const regex = /equip/;
        
        try {
            let currentItem = await itemModel.findOne({ name: itemAction });
                if (!currentItem) {
                    interaction.reply('Item does not exist.')
                } else if (profileData.equipment.includes(currentItem.name)) {
                    profileData.equipment.splice(profileData.equipment.indexOf(currentItem.name), 1);
                    profileData.inventory.push({
                        name: currentItem.name,
                        quantity: 1
                    });
                    profileData.save();
                    interaction.reply(`You have successfully unequipped a \`${currentItem.name}\`.`)
                } else if (!profileData.equipment.includes(currentItem.name)) {
                    interaction.reply('You don\'t have that item equipped!')
                } else {
                    interaction.reply('Something went wrong.');
                }
        }
        catch (err) {
            console.log(err);
            interaction.reply('Item does not exist.');
        }
    }
}
