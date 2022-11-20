const { SlashCommandBuilder } = require("@discordjs/builders"),
  { iTranslate } = require("../handlers/language"),
  { getItemList } = require("../handlers/itemInventory");

// const TRANSLATION_PATH = "subcommands.use";
const REJECTION_PATH = "rejection.items";
module.exports = {
  data: new SlashCommandBuilder().setName("use").setDescription("Use item."),
  /**
   *
   * @param {import('discord.js').Interaction} interaction
   * @param {import('../models/profileSchema').User} profileData
   * @returns
   */
  async execute(interaction, profileData) {
    // @ts-ignore
    const itemAction = interaction.item
      ? // @ts-ignore
        interaction.item.toLowerCase()
      : // @ts-ignore
        interaction.options.getString("item").toLowerCase();
    // @ts-ignore
    const amount = interaction.item
      ? 1
      : // @ts-ignore
        interaction.options.getNumber("amount") || 1;

    const { guild } = interaction,
      itemList = getItemList(),
      currentItem =
        itemList[
          Object.keys(itemList).filter(
            (item) => itemList[item].name.toLowerCase() === itemAction
          )
        ];
    try {
      // @ts-ignore
      const ownedIndex = profileData.inventory.findIndex(
        (item) => item.id == currentItem.id
      );
      if (!currentItem) {
        throw "item_not_found";
      } else if (ownedIndex === -1) {
        throw "item_not_owned";
      } else if (currentItem.type !== 1 && currentItem.type !== 2) {
        throw "item_not_usable";
      } else if (amount > profileData.inventory[ownedIndex].quantity) {
        throw "item_not_enough";
      } else {
        const finalAmount = profileData.inventory[ownedIndex].quantity - amount;
        // @ts-ignore
        if (finalAmount === 0) {
          // @ts-ignore
          profileData.inventory.splice(ownedIndex, 1);
        } else {
          profileData.inventory[ownedIndex].quantity = finalAmount;
        }
        // @ts-ignore
        await profileData.save();
        if (currentItem.type === 2) return;
        const itemUse = require(`../items/${currentItem.path}`);
        if (itemUse) {
          return await itemUse.use(
            interaction,
            profileData,
            currentItem,
            amount
          );
        }
      }
    } catch (error) {
      // @ts-ignore
      return await interaction.reply({
        content: iTranslate(guild, `${REJECTION_PATH}.${error}`),
      });
    }
  },
};
