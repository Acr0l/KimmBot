const { SlashCommandBuilder } = require("@discordjs/builders"),
  { getItemList } = require("../handlers/itemInventory"),
  { iTranslate } = require("../handlers/language");

const TRANSLATION_PATH = "subcommands.sell";
const REJECTION_PATH = "rejection.items";
module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell item to the shop."),
  async execute(interaction, profileData) {
    // Get guild data -> Guild language
    const { guild } = interaction,
      // Get amount of items to sell
      amount = interaction.options.getNumber("amount") || 1,
      // Get item to sell (String)
      itemToSell = interaction.options.getString("item"),
      // Get list to compare which item to sell
      itemList = getItemList(),
      currentItem =
        itemList[
          Object.keys(itemList).filter(
            (item) => itemList[item].name.toLowerCase() === itemToSell.toLowerCase()
          )
        ],
      /** @type {Number} */
      ownedIndex = profileData.inventory.findIndex(
        /** @param {Object} item @param {String} item._id */
        (item) => item._id === currentItem?.id
      ),
      finalAmount = profileData.inventory[ownedIndex]?.quantity - amount,
      /** @type {Boolean} */
      equipped = profileData.equipment.some(
        /** @param {String} item */
        (item) => item === currentItem?.id
      );
    try {
      if (!currentItem) {
        throw "item_not_found";
      } else if (equipped && ownedIndex === -1) {
        throw "item_equipped";
      } else if (ownedIndex === -1) {
        throw "item_not_owned";
      } else if (finalAmount < 0) {
        throw "invalid_quantity";
      }
      // TODO: Item not available
      if (finalAmount === 0) {
        profileData.inventory.splice(ownedIndex, 1);
      } else {
        profileData.inventory[ownedIndex].quantity = finalAmount;
      }
      // Add cash to user
      profileData.dons += currentItem.price * amount;
      await profileData.save();
      await interaction.reply({
        content: iTranslate(guild, `${TRANSLATION_PATH}.success`, {
          count: amount,
          currentItem,
          user: interaction.user,
        }),
      });
    } catch (error) {
      return await interaction.reply({
        content: iTranslate(guild, `${REJECTION_PATH}.${error}`),
      });
    }
  },
};
