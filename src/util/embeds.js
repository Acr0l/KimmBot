const { EmbedBuilder } = require("discord.js");
const { PRIMARY, INFO, SUCCESS, WRONG } = require("../constants/constants");
const { iTranslate } = require("../handlers/language");
const quizCategories = require("./quizCategories");

const QUESTION_EMBED_PATH = "embed";
const ANSWER_EMBED_PATH = "answer_embed";
const FINISH_EMBED_PATH = "finish_embed";
const AVATAR_URL = "https://cdn.discordapp.com/avatars";

/**
 * The embed for the question, with the advantage of color and more being ready.
 * @param { import('discord.js').Guild } guild - The guild the interaction was sent from.
 * @param { import('../models/quizSchema').Question } question - The question itself
 * @param { Number } type - The index of the category in the quizCategories object.
 * @returns { import('discord.js').EmbedBuilder }
 */
exports.questionEmbedConstructor = (guild, question, type) => {
  return new EmbedBuilder()
    .setTitle(question.question)
    .setColor(PRIMARY)
    .setDescription(
      iTranslate(guild, `${QUESTION_EMBED_PATH}.description`, {
        ns: "problem",
      })
    )
    .setFooter({
      text: iTranslate(guild, `${QUESTION_EMBED_PATH}.footer`, {
        ns: "problem",
        category: quizCategories[type],
        id: question._id,
      }),
    })
    .setImage(question.image ?? null);
};

/**
 * Builds an embed to display status of answer.
 * @param { import('discord.js').Guild } guild - The guild from the interaction
 * @param { Boolean } isCorrect - Whether the question was answered correctly or not.
 * @param { import('discord.js').CommandInteraction } param2 - The user, deconstructed
 * @param { Number } meSpent - The amount of mental energy spent.
 * @param { Number } type - The index of the category in the quizCategories object.
 * @param { import('../models/quizSchema').Question } question - The question answered.
 * @param { Number | undefined } xp - The xp received
 * @param { Number | undefined } donsGained - The dons (currency) gained
 * @returns { import('discord.js').EmbedBuilder }
 */
exports.answerEmbedConstructor = (
  guild,
  isCorrect,
  { user: { username, id, avatar } },
  meSpent,
  type,
  question,
  xp,
  donsGained
) => {
  const answerTitle = isCorrect ? "correct.title" : "incorrect.title";
  const answerDescription = isCorrect
    ? "correct.description"
    : "incorrect.description";
  return new EmbedBuilder()
    .setTitle(
      iTranslate(guild, `${ANSWER_EMBED_PATH}.${answerTitle}`, {
        ns: "problem",
        username,
      })
    )
    .setDescription(
      iTranslate(guild, `${ANSWER_EMBED_PATH}.${answerDescription}`, {
        ns: "problem",
        meSpent,
        username,
        xp,
        dons: donsGained,
        context: question.category.toLowerCase(),
      })
    )
    .setFooter({
      text: `${quizCategories[type].type} id: \`${question?._id}\``,
    })
    .setColor(isCorrect ? SUCCESS : WRONG)
    .setThumbnail(
      quizCategories[type].image[isCorrect ? "correct" : "incorrect"]
    )
    .setAuthor({
      name: username,
      iconURL: `${AVATAR_URL}/${id}/${avatar}.png?size=256`,
    });
};

/**
 *
 * @param {import('discord.js').Guild | Null} guild - Guild where the interaction was sent from.
 * @param {{_id: String}} question - Question to answer
 * @returns {import('discord.js').EmbedBuilder} - The embed
 */
exports.finishEmbedConstructor = (guild, { _id: id }) =>
  new EmbedBuilder()
    .setTitle(
      iTranslate(guild, `${FINISH_EMBED_PATH}.title`, { ns: "problem" })
    )
    .setColor(INFO)
    .setDescription(
      iTranslate(guild, `${FINISH_EMBED_PATH}.description`, {
        ns: "problem",
        id,
      })
    )
    .setTimestamp();
