const { SlashCommandBuilder } = require("@discordjs/builders"),
  {
    EmbedBuilder,
    ComponentType,
    SelectMenuBuilder,
    ActionRowBuilder,
  } = require("discord.js"),
  { getItemList } = require("../../handlers/itemInventory"),
  { iTranslate } = require("../../handlers/language"),
  { SECONDARY } = require("../../constants/constants.js");
// TODO: Dynamically generate select menu options (Remove chosen category from list)
module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Display available items."),
  /**
   * Display shop and current available items.
   * @param {import('discord.js').Interaction} userInteraction
   * @see {@link https://discord.js.org/#/docs/main/stable/class/Interaction}
   */
  async execute(userInteraction) {
    // #region Variables
    /**
     * @typedef {import('discord.js').Guild} Guild
     */
    /**
     * @type {Guild | null}
     * @see {@link https://discord.js.org/#/docs/main/stable/class/Guild}
     */
    const guild = userInteraction.guild;
    const langTypes = iTranslate(guild, "shop.item_types", {
      returnObjects: true,
    });
    const items = getItemList(),
      sortedKeys = Object.keys(items).sort(
        (a, b) => items[a].price - items[b].price
      ),
      // TODO: Add image to shop embed
      /**
       * @typedef {Object} ShopEmbed
       * @property {String} title
       * @property {String} description
       */
      /** @type {ShopEmbed} */
      { title, description } = iTranslate(guild, "shop.embed.start_embed", {
        returnObjects: true,
      }),
      initialEmbed = new EmbedBuilder()
        .setTitle(title)
        .setColor(SECONDARY)
        .setDescription(description);
    // #endregion
    const categories = Object.keys(langTypes).map((type, i) => {
      return {
        source: type,
        type: langTypes[type],
        items: sortedKeys
          .filter((key) => items[key].type === i)
          .map((key) => {
            return {
              name: `${items[key].name} (Ɖ${items[key].price})`,
              description: iTranslate(
                guild,
                `descriptions.${items[key].description.toLowerCase()}`,
                { ns: "items" }
              ),
            };
          }),
      };
    });
    const componentOptions = categories.map((category) => {
      return {
        label: category.type,
        value: Object.keys(langTypes).find(
          (key) => langTypes[key] === category.type
        ),
        description: iTranslate(
          guild,
          `shop.category_description.${category.source}`
        ),
      };
    });
    /** @param {Boolean} state */
    const components = (state) => [
      new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId("shop")
          .setPlaceholder(
            iTranslate(guild, "select_category", { ns: "common" })
          )
          .setDisabled(state)
          .addOptions(componentOptions)
      ),
    ];
    // @ts-ignore
    await userInteraction.reply({
      embeds: [initialEmbed],
      components: components(false),
    });
    /** @param {import('discord.js').Interaction} i */
    const filter = (i) => {
      // @ts-ignore
      return i.user.id === userInteraction.user.id && i.customId === "shop";
    };
    const collector = userInteraction.channel.createMessageComponentCollector({
      filter,
      componentType: ComponentType.SelectMenu,
      time: 120000,
    });

    collector.on("collect", async (collectorInteraction) => {
      const [selectedCategory] = collectorInteraction.values;
      // TODO: #2 Error handler
      const cat2 = categories.find(
        (cat) => cat.source === selectedCategory.toLowerCase()
      ) || { type: "Error", source: "error", items: [] };
      const embed2 = new EmbedBuilder()
        .setTitle(cat2.type)
        .setColor(SECONDARY)
        .setDescription(
          iTranslate(guild, `shop.category_description.${cat2.source}`)
        )
        .setFields(
          cat2.items.map((item) => {
            return {
              name: item.name,
              value: item.description,
            };
          })
        );
      try {
        await collectorInteraction.update({ embeds: [embed2] });
      } catch (error) {
        await collectorInteraction.update({
          content: iTranslate(guild, "error"),
        });
        console.error(error);
      }
    });

    collector.on("end", () => {
      // @ts-ignore
      userInteraction.editReply({
        embeds: [initialEmbed],
        components: components(true),
      });
    });
  },
};
