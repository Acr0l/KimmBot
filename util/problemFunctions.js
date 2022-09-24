// Required variables:
const { SnowflakeUtil } = require("discord.js"),
  { applyXp } = require("./levelFunctions"),
  quizDatabase = require("../models/quizSchema"),
  {
    setActivity,
    deleteActivity,
    hasActivity,
  } = require("../handlers/activity"),
  mustache = require("mustache"),
  { applyStatChanges } = require("./tierFunctions"),
  { translate, getLanguage } = require("../handlers/language"),
  quizCategories = require("../util/quizCategories");
const { hintHandler } = require("../handlers/hint");
const { shuffleAlternatives, numberOfAlternatives } = require("../util/shufflers");
const logger = require("../logger");
const {
  createHintButton,
  rowConstructor,
} = require("../handlers/problemGens");
const {
  questionEmbedConstructor,
  answerEmbedConstructor,
  finishEmbedConstructor,
} = require("./embeds");

async function generateQuiz(interaction, profileData, type, client) {
  // Defer response
  await interaction.deferReply({ ephemeral: true });
  const { guild } = interaction;

  // Check if the user can take the quiz
  if (!(await checkUser({ interaction, profileData, guild }))) return true;

  // Variables
  const subject = interaction.options.getString("subject");
  // REMOVE: Not needed, but keeping for now.
  let answerTime = 0;

  // Check if the subject is valid
  if (!(await checkValidSubject({ interaction, subject, guild }))) {
    return true;
  }

  // Get the quiz question
  // [var] is to get the first element
  // @ts-ignore
  const [question] = await getQuizQuestion({
    interaction,
    type,
    subject,
    guild,
  });

  // Set activity
  setActivity(interaction.user.id, question._id);

  // Variables to store the settings
  const hintEmoji = client.emojis.cache.get("905990062095867935"),
    options = {
      alternatives: shuffleAlternatives(
        numberOfAlternatives(question),
        question
      ),
      hint: false,
      correct_answer: question.correct_answer,
    },
    embed = questionEmbedConstructor(guild, question, type),
    hintButton = createHintButton(guild),
    componentInfo = rowConstructor(
      question,
      interaction,
      guild,
      options,
    );

  // Reply
  await interaction.editReply({
    embeds: [embed],
    ephemeral: true,
    components: [componentInfo.row, hintButton(false)],
  });

  // Create message component collectors
  const collector = interaction.channel.createMessageComponentCollector({
      filter: componentInfo.filter,
      componentType: componentInfo.cType,
      time: quizCategories[type].time * 1000,
    }),
    hintCollector = interaction.channel.createMessageComponentCollector({
      filter: (i) => i.customId == "getHint",
      componentType: "BUTTON",
      time: (quizCategories[type].time - 3) * 1000,
      max: 1,
    });

  // Collect hint
  hintCollector.on("collect", async (i) => {
    hintHandler({
      question,
      options,
      profileData,
      guild,
      embed,
      hintEmoji,
      hintButton,
      hintCollector,
      i,
    });
  });

  // Collect the answer
  collector.on("collect", async (i) => {
    await i.deferReply();
    await interaction.editReply({
      embeds: [embed],
      ephemeral: true,
      components: [],
    });
    // Get the answer
    const [answer] = /^problemButton[1-9]$/.test(i.customId)
      ? options.alternatives[i.customId.match(/[1-9]/)[0]].value
      : i.values;
    const isCorrect = answer === question.correct_answer;
    answerTime = Math.floor(
      (Date.now() - Number(SnowflakeUtil.deconstruct(i.message.id).timestamp)) /
        1000
    );

    // Return if time is up
    if (answerTime >= quizCategories[type].time) {
      interaction.followUp(translate(guild, "PROBLEM_SELECT_TIME_EXPIRED"));
      return;
    }
    const [xp, donsGained] = rewards(type, answerTime, question);
    const meSpent = quizCategories[type].meFormula(
        answerTime,
        question.difficulty
        ),
      collectorEmbed = answerEmbedConstructor(
        guild,
        isCorrect,
        interaction,
        meSpent,
        type,
        question,
        xp,
        donsGained
      );
    // Apply the spent mental energy
    profileData = await updateMe({
      profileData,
      meSpent,
      guild,
      i,
      question,
      answer,
    });
    if (!profileData) {
      collector.stop();
      return;
    }

    if (isCorrect) {
      // Get rewards
      profileData = applyXp(profileData, xp);
      profileData.dons += donsGained || 0;
    }
    // Reply
    await i.editReply({
      embeds: [collectorEmbed],
    });

    // End the interaction
    collector.stop();
  });

  collector.on("end", async (collected) => {
    const endEmbed = finishEmbedConstructor(
      guild,
      question,
    );

    await interaction.editReply({ embeds: [endEmbed], components: [] });
    // Delete activity
    deleteActivity(interaction.user.id);

    // Check if the user answered the question
    if (collected.size != 0) return;
    const meSpent = quizCategories[type].meFormula(
      answerTime,
      quizCategories[type].time * 1000
    );
    // Apply the spent mental energy
    profileData.mentalEnergy.me = Math.max(
      0,
      profileData.mentalEnergy.me - meSpent
    );
    interaction.followUp(
      mustache.render(translate(guild, "PROBLEM_TIME_EXPIRED"), {
        me: profileData.mentalEnergy.me,
      })
    );
    await profileData.save();
    hintCollector.stop();
  });
}

async function checkUser({ interaction, profileData, guild }) {
  if (hasActivity(interaction.user.id)) {
    await interaction.editReply(translate(guild, "PROBLEM_ONGOING"));
    return false;
    // Check if the user has enough me
  } else if (profileData.mentalEnergy.me <= 10) {
    await interaction.editReply(translate(guild, "PROBLEM_REST"));
    return false;
  }

  return true;
}

/**
 * Give the rewards a user receives after successfully completing the problem.
 * @param {String} type - Either Warmup, Workout, or Challenge
 * @param {Number} answerTime - Amount in seconds of time the user took to answer
 * @param {*} question - Yes
 * @returns {number[]} - The xp and dons received, respectively.
 */
function rewards(type = "Warmup", answerTime, question) {
  const ans = [0];
  ans.push(quizCategories[type].xpFormula(question.difficulty));
  if (quizCategories[type].type === "Workout") {
    ans.push(quizCategories[type].donsFormula(question.difficulty, answerTime));
  }

  return [...ans];
}

async function checkValidSubject({ interaction, subject, guild }) {
  // Available subjects
  const { availableSubjects } = require("./subjects.json");
  if (availableSubjects.indexOf(subject) === -1) {
    await interaction.editReply(
      translate(guild, "PROBLEM_SUBJECT_NOT_SUPPORTED")
    );
    return false;
  }
  return true;
}

async function getQuizQuestion({
  interaction,
  subject,
  type,
  guild,
  quantity = 1,
}) {
  // Random element is stored in "question"
  // match is to filter possible questions, sample is to pick a random one.
  try {
    const question = await quizDatabase.aggregate([
      {
        $match: {
          $and: [
            { subject },
            { category: quizCategories[type].type },
            { lang: getLanguage(guild) },
          ],
        },
      },
      { $sample: { size: quantity } },
    ]);
    if (!question) {
      await interaction.editReply("No questions found");
      return false;
    }
    return question;
  } catch (err) {
    logger.log(err);
  }
}

async function updateMe({ profileData, meSpent, guild, i, question, answer }) {
  if (profileData.mentalEnergy.me - meSpent < 0) {
    // Not enough energy
    profileData.mentalEnergy.me = 0;
    await i.editReply(
      mustache.render(translate(guild, "PROBLEM_NOT_ENOUGH_ME"), {
        meSpent,
      })
    );
    profileData.save();
    return false;
  }

  profileData.mentalEnergy.me -= meSpent;
  profileData = await applyStatChanges(
    profileData,
    {
      name: question.subject,
      correct: answer === question.correct_answer,
    },
    i
  );
  return profileData;
}

module.exports = {
  generateQuiz,
  checkUser,
  rewards,
  checkValidSubject,
  getQuizQuestion,
  updateMe,
};
