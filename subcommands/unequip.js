const { SlashCommandBuilder } = require("@discordjs/builders"),
  { getItemList } = require("../handlers/itemInventory"),
  { iTranslate } = require("../handlers/language");

const TRANSLATION_PATH = "subcommands.unequip";
const REJECTION_PATH = "rejection.items";
module.exports = {
  data: new SlashCommandBuilder()
    .setName("unequip")
    .setDescription("Unequip selected item."),
  /**
   *
   * @param {import('discord.js').BaseInteraction} interaction
   * @param {import('../models/profileSchema').User} profileData
   * @returns
   */
  async execute(interaction, profileData) {
    /** @type {String} */
    // @ts-ignore
    const itemAction = interaction.options.getString("item"),
      guild = interaction.guild;
    const itemList = getItemList();
    try {
      const currentItem =
        itemList[
          Object.keys(itemList).filter(
            (item) =>
              itemList[item].name.toLowerCase() === itemAction.toLowerCase()
          )
        ];
      if (!currentItem) {
        throw "item_not_found";
      } else if (!profileData.equipment.includes(currentItem.id)) {
        throw "item_not_equipped";
      }
      // Remove item from equipment
      profileData.equipment = profileData.equipment.filter(
        (item) => item !== currentItem.id
      );
      // Add item to inventory
      // @ts-ignore
      profileData.inventory.push({
        _id: currentItem.id,
        quantity: 1,
      });
      // @ts-ignore
      await profileData.save();
      // @ts-ignore
      await interaction.reply({
        content: iTranslate(guild, `${TRANSLATION_PATH}.success`, {
          currentItem,
        }),
      });
    } catch (err) {
      // @ts-ignore
      if (typeof err !== "string") {
        // @ts-ignore
        return interaction.reply(
          { content: iTranslate(guild, "error", { ns: "common", user: interaction.user }) }
        );
      }
      // @ts-ignore
      interaction.reply(
        iTranslate(guild, `${REJECTION_PATH}.${err}`, { ns: "glossary" })
      );
    }
  },
};
