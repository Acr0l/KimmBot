const { SlashCommandBuilder } = require("@discordjs/builders"),
  { EmbedBuilder } = require("discord.js"),
  { levelFormula } = require("../../util/levelFunctions"),
  { translate, iTranslate } = require("../../handlers/language"),
  { getItem } = require("../../handlers/itemInventory"),
  // @ts-ignore
  { PRIMARY } = require("../../constants/constants");
const DISCORD_PATH = "https://cdn.discordapp.com/avatars/";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("See your info"),
  async execute(interaction, profileData) {
    // #region CONSTANTS
    const USER_AVATAR = `${DISCORD_PATH}${profileData.userID}/${interaction.user.avatar}.jpeg`;
    const { guild } = interaction;
    const lvlPercentage = (
        (profileData.xp / levelFormula(profileData.level)) *
        100
      ).toFixed(2),
      effectMr = profileData.effects
        .map((effect) => effect.mrBoost)
        .reduce((a, b) => a + b, 0),
      effectMe = profileData.effects
        .map((effect) => effect.meBoost)
        .reduce((a, b) => a + b, 0),
      embedValues = iTranslate(guild, "profile.embed", {
        ns: "glossary",
        returnObjects: true,
        user: interaction.user.username,
        level: profileData.level,
        percentage: lvlPercentage,
        experience: profileData.xp,
        tier: profileData.tier,
      }),
      stats = `**ME**: ${profileData.mentalEnergy.me}/${
        profileData.mentalEnergy.totalMe
      }${effectMe !== 0 ? ` (+${effectMe})` : ""}\n**MR**: ${
        profileData.mentalEnergy.mr
      }${effectMr !== 0 ? ` (+${effectMr})` : ""}`;
    const equipped =
      profileData.equipment != 0
        ? profileData.equipment
            .map((e) => `-  **${getItem(e).name}**`)
            .join("\n")
        : translate(guild, "PROFILE_NO_EQUIPMENT");
    // #endregion
    // #region Profile Embed
    const profileEmbed = new EmbedBuilder()
      .setColor(PRIMARY)
      .setTitle(profileData.title[0])
      .setAuthor({
        name: embedValues.author,
        iconURL: USER_AVATAR,
      })
      .setThumbnail(USER_AVATAR)
      .addFields(
        {
          name: embedValues.progress,
          value: embedValues.progress_value,
        },
        {
          name: embedValues.stats,
          value: stats,
        },
        { name: embedValues.equipment, value: equipped, inline: true },
        { name: embedValues.money, value: `Ɖ${profileData.dons}`, inline: true }
      )
      .setTimestamp();
    // #endregion
    await interaction.reply({ embeds: [profileEmbed] });
  },
};
