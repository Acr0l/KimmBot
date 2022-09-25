const { SlashCommandBuilder } = require("@discordjs/builders"),
  {
    EmbedBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
    ComponentType,
  } = require("discord.js"),
  { iTranslate } = require("../../handlers/language"),
  { HELP_START_COMPONENT_ID } = require("../../constants/componentIds"),
  { INFO, SECONDARY } = require("../../constants/constants");

const NS = "glossary";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Short description about the available commands."),

  async execute(interaction, profileData, client) {
    // Get guild.
    const { guild } = interaction,
      categoryNames = iTranslate(guild, "help.row.directories", {
        returnObjects: true,
        ns: NS,
      });
    const dirCategories = Object.keys(categoryNames).map((key) => {
      const commandsInCat = client.commands
        .filter((cmd) => cmd.directory == key)
        .map((cmd) => {
          return { name: cmd.data.name, description: cmd.data.description };
        });
      return { dir: key, commands: commandsInCat };
    });
    const startEmbed = new EmbedBuilder()
      .setTitle(iTranslate(guild, "help.start_embed.title", { ns: NS }))
      .setDescription(
        iTranslate(guild, "help.start_embed.description", { ns: NS })
      )
      .setColor(INFO);
    const categoriesComponent = (state) => [
      new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId(HELP_START_COMPONENT_ID)
          .setPlaceholder(iTranslate(guild, "help.row.placeholder", { ns: NS }))
          .setDisabled(state)
          .addOptions(
            dirCategories.map((dir) => {
              const { emoji } = require(`../${dir.dir}/desc.json`) || null;
              return {
                /** @type {String} */ label: categoryNames[dir.dir],
                /** @type {String} */ value: dir.dir,
                /** @type {String} */ description: iTranslate(
                  guild,
                  "help.row.description",
                  { ns: NS, category: dir.dir }
                ),
                /** @type {String} */ emoji: emoji,
              };
            })
          )
      ),
    ];
    await interaction.reply({
      embeds: [startEmbed],
      components: categoriesComponent(false),
    });
    /**
     *  @param { Object } i - Triggered by component
     *  @param { String } i.customId - Triggered by component
     */
    const filter = (i) => i.customId === HELP_START_COMPONENT_ID;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      componentType: ComponentType.SelectMenu,
      time: 40000,
    });

    collector.on("collect", (i) => {
      const [directory] = i.values;
      const chosenCategory =
        dirCategories.find((cat) => cat.dir == directory) || undefined;

      const categoryEmbed = new EmbedBuilder()
        .setTitle(
          iTranslate(guild, "help.category_embed.title", {
            ns: NS,
            category: categoryNames[directory],
          })
        )
        .setDescription(
          iTranslate(
            guild,
            [`${NS}:descriptions.categories.${directory}`, "common:not_found"],
            { resource: "category", context: "female", target: "description" }
          )
        )
        .setColor(SECONDARY)
        .setFields(
          chosenCategory?.commands.map((cmd) => {
            return {
              name: `\`${cmd.name}\``,
              value: iTranslate(
                guild,
                [
                  `command_descriptions.${cmd.name.toLowerCase()}`,
                  "common:not_found",
                ],
                { resource: "command", target: "description" }
              ),
              inline: true,
            };
          })
        );

      i.update({ embeds: [categoryEmbed] });
    });

    collector.on("end", () => {
      interaction.editReply({
        embeds: [startEmbed],
        components: categoriesComponent(true),
      });
    });
  },
};
