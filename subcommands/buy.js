const { SlashCommandBuilder } = require('@discordjs/builders'),
    itemModel = require('../models/itemSchema'),
    { translate } = require('../handlers/language'),
    mustache = require('mustache');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`buy`)
        .setDescription(`Buy item from shop.`),
    /**
     * Execute the command.
     * @param { Message } interaction - The message that triggered the command.
     * @param { Object } profileData - The profile data of the user.
     * @param { Client } client - The client instance.
     */
    async execute(interaction, profileData, client) {
        const { guild } = interaction,
            itemToBuy = interaction.options.getString('item'),
            amount = parseInt(interaction.options.getNumber('amount')) || 1;
        let currentItem;

        // TODO: #1 Instead of using the item name, use item id.

        try {
            currentItem = await itemModel.findOne({ name: itemToBuy });
            if (!currentItem) {
                await interaction.reply(translate(guild, 'INVALID_INPUT'));
                return;
            }
            const owned = profileData.inventory.findIndex(
                (e) => e.id == currentItem._id,
            );
            const exist =
                owned != -1 || profileData.equipment.includes(currentItem._id);
            if (currentItem.unique && exist) {
                await interaction.reply(translate(guild, 'ITEM_OWNED'));
                return;
            } else if (currentItem.unique && amount > 1) {
                await interaction.reply(
                    translate(guild, 'BUY_ITEM_AMOUNT_UNIQUE'),
                );
                return;
            } else {
                if (currentItem.price * amount > profileData.dons)
                    return interaction.reply(
                        translate(guild, 'INSUFFICIENT_MONEY'),
                    );
                if (currentItem.price * amount <= profileData.dons) {
                    if (owned !== -1) {
                        profileData.inventory[owned].quantity += amount;
                    } else {
                        profileData.inventory.push({
                            id: currentItem._id,
                            quantity: amount,
                        });
                        if (currentItem.effect) {
                            profileData.inventory[
                                profileData.inventory.length - 1
                            ].effect = currentItem.effect;
                        }
                    }
                    profileData.dons -= currentItem.price * amount;
                    profileData.save();
                    let text =
                        amount > 1
                            ? translate(guild, 'BUY_SUCCESS').split(':')[1]
                            : translate(guild, 'BUY_SUCCESS').split(':')[0];
                    await interaction.reply(
                        mustache.render(text, {
                            item: currentItem.name,
                            amount,
                            price: currentItem.price * amount,
                        })
                    );
                }
            }
        } catch (error) {
            console.log(error);
        }
    },
};
