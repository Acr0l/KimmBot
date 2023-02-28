// Required variables:
const { SlashCommandBuilder } = require("@discordjs/builders"),
  // { subjects } = require('../../util/subjects.json'),
  subjectsArr = [],
  { generateQuiz } = require("../../util/problemFunctions"),
  logger = require("../../logger");

// for (const subject of Object.keys(subjects)) {
subjectsArr.push({ name: "Math", value: "Math" });
// }

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("warmup")
    .setDescription("Quick question to warm up those neurons.")
    .addStringOption((option) =>
      option
        .setName("subject")
        .setDescription("Subject to warm up")
        .setRequired(true)
        .addChoices(...subjectsArr)
    ),
  /**
   * Kimm bot command
   * @param { import('discord.js').CommandInteraction} interaction - The interaction that triggered the command
   * @param { import('../../models/profileSchema').User} profileData - User info that is stored in the database.
   * @param { import('discord.js').Client} client - Client, mostly used by help cmd.
   */
  async execute(interaction, profileData, client) {
    if (!generateQuiz(interaction, profileData, 0, client))
      logger.info("Error generating quiz");
  },
};
