const { SlashCommandBuilder } = require("@discordjs/builders");
const { getLanguage } = require("../../handlers/language");
const logger = require("../../logger");
const { checkUser } = require("../../util/problemFunctions");
const quizDatabase = require("../../models/quizSchema");
const { questionEmbedConstructor } = require("../../util/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`warmtest`)
    .setDescription(`Improving quiz performance.`),
  /**
   * Kimm bot command
   * @param { import('discord.js').CommandInteraction} interaction - The interaction that triggered the command
   * @param { import('../../models/profileSchema').User} profileData - User info that is stored in the database.
   */
  async execute(interaction, profileData) {
    const { guild } = interaction;
    if (!guild) {
      return interaction.reply(
        "You cannot invoke commands outside Discord servers"
      );
    }
    if (!(await checkUser({ interaction, profileData, guild }))) return true;
    const [question] = await getQuizQuestion({
      interaction: interaction,
      subject: "Math",
      guild,
    });
    const questionEmbed = questionEmbedConstructor(guild, question, 0);
    interaction.reply({ embeds: [questionEmbed] });
  },
};

/**
 *
 * @param { Object } questionSpecs
 * @param { import('discord.js').CommandInteraction } questionSpecs.interaction
 * @param { String } questionSpecs.subject
 * @param { import('discord.js').Guild } questionSpecs.guild
 * @param { Number } [questionSpecs.quantity]
 * @returns { Promise<Object[]> }
 */
async function getQuizQuestion({ interaction, subject, guild, quantity = 1 }) {
  const pipelines = [
    {
      $match: {
        $and: [
          { subject },
          { category: "Warmup" },
          { lang: getLanguage(guild) },
        ],
      },
    },
    { $sample: { size: quantity } },
  ];
  // Random element is stored in "question"
  // match is to filter possible questions, sample is to pick a random one.
  try {
    // @ts-ignore
    const question = await quizDatabase.aggregate(pipelines);
    if (!question) {
      await interaction.editReply("No questions found");
      return [];
    }
    return question;
  } catch (err) {
    logger.log(err);
    return [];
  }
}
