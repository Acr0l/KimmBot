// @ts-nocheck
const {
    SlashCommandBuilder,
    StringSelectMenuBuilder,
  } = require("@discordjs/builders"),
  { readyToAdvance } = require("../../util/tierFunctions"),
  { translate, iTranslate, getLanguage } = require("../../handlers/language"),
  Challenges = require("../../models/challenges"),
  {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    ModalBuilder,
    TextInputBuilder,
  } = require("discord.js"),
  { hasActivity } = require("../../handlers/activity"),
  wait = require("util").promisify(setTimeout),
  { TextInputStyle } = require("discord-api-types/payloads/v10"),
  CatMap = require("../../constants/categories"),
  { INFO, CHALLENGE } = require("../../constants/constants"),
  { Types } = require("../../constants/problem"),
  { MATH } = require("../../constants/subjects"),
  logger = require("../../logger");
// At least 80% of the questions must be correct.
const PASSING_GRADE = 0.8,
  SEQUENCE_DROPDOWN_ID = "dropdownChallengeActionRow",
  INPUTS_ID = "kimmChallengeInput",
  INPUTS_TEXT_ID = "kimmChallengeInputText",
  CONFIRM_MODAL = "kimmModalConfirm";
const ChallengeParams = CatMap.get("Challenge") || null;
/*
Chart
Confirm Challenge -> Fetch Questions -> Validate -> Build Questions -> Display & Receive -> Store & Repeat
Process Results -> Display & Close
*/
module.exports = {
  // 86400 * 3
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("challenge")
    .setDefaultMemberPermissions(0)
    .setDescription("The ultimate test"),

  /**
   * Kimm bot command
   * @param { import('discord.js').CommandInteraction} interaction - The interaction that triggered the command
   * @param { import('../../models/profileSchema').User} user - User info that is stored in the database.
   */
  async execute(interaction, user) {
    // Constants
    const { guild } = interaction;
    // #region Requirements
    // Check if the user meets the requirements to be a Challenger.
    if (!meetsChallengeRequirements({ profileData: user, interaction, guild }))
      return;
    // #endregion
    // #region Confirmation

    // TODO: Adapt to work if localization keys are missing.
    // Get localized message with information about the Challenge (N° of questions, time to do it),
    // after 10 seconds it will allow the user to proceed with the questions.

    // Message
    const confirmationEmbed = iTranslate(guild, "initiation", {
      ns: "challenge",
      returnObjects: true,
      questionAmount: ChallengeParams.questionAmount,
      time: ChallengeParams.humanTime(guild),
      totalTime: ChallengeParams.humanTotalTime(guild),
    });
    // Buttons (toggle)
    const row = (state) => [
      new ActionRowBuilder().addComponents([
        new ButtonBuilder()
          .setCustomId(CHALLENGE.idChallengeConfirm)
          .setLabel(capitalize(iTranslate(guild, "proceed")))
          .setStyle(ButtonStyle.Success)
          .setEmoji("✔")
          .setDisabled(state),
        new ButtonBuilder()
          .setCustomId(CHALLENGE.idChallengeReject)
          .setLabel(capitalize(iTranslate(guild, "goBack")))
          .setStyle(ButtonStyle.Danger)
          .setEmoji("✖️")
          .setDisabled(state),
      ]),
    ];
    // Message + Buttons => Embed
    const confirmationMessage = new EmbedBuilder()
      .setTitle(confirmationEmbed.title)
      .setDescription(confirmationEmbed.description)
      .setColor(INFO)
      .addFields(
        Object.keys(confirmationEmbed.fields).map((fieldKey) => {
          const name = capitalize(iTranslate(guild, fieldKey));
          return {
            name,
            value: confirmationEmbed.fields[fieldKey],
          };
        })
      );
    // Send confirmation
    await interaction.reply({
      embeds: [confirmationMessage],
      ephemeral: true,
    });
    // Wait for 10 seconds
    await wait(10000);
    // Allow confirmation (display buttons)
    await interaction.editReply({
      components: row(false),
    });
    // Get response
    const confirmed = await interaction.channel
      .awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 10000,
        max: 1,
      })
      .then(async (i) => {
        const challengeResponse = i.customId === CHALLENGE.idChallengeConfirm;
        if (challengeResponse) {
          await i.update({
            content: iTranslate(guild, "glossary:challenge.answer.accepted"),
            components: [],
            embeds: [],
          });
        } else {
          await i.editReply({
            content: iTranslate(guild, "glossary:challenge.answer.rejected"),
            components: [],
            embeds: [],
          });
        }
        return challengeResponse;
      })
      .catch(() => {
        interaction.editReply(
          iTranslate(guild, "glossary:rejection.time.expired")
        );
        return false;
      });
    // Exit if the Challenge was dismissed
    if (!confirmed) return;
    // #endregion
    // #region Question
    // Get questions
    const challengeQuestions = await Challenges.aggregate([
      {
        $match: {
          $and: [
            { subject: MATH },
            { tier: user.tier },
            {
              lang: getLanguage(guild),
            },
          ],
        },
      },
      {
        $sample: {
          size: ChallengeParams.questionAmount,
        },
      },
    ]);
    // Confirm questions exist
    if (challengeQuestions.length != ChallengeParams.questionAmount) {
      return interaction.followUp(
        iTranslate(guild, "challenge:failure.notEnoughQuestions")
      );
    }
    /**
     * @typedef {Object} answerData
     * @property { String } id
     * @property { Number } time
     */
    /**
     * @type { {correct: answerData[], incorrect: answerData[]}}
     */
    const challengeData = {
      correct: [],
      incorrect: [],
    };
    // TODO: Build questions
    for (const question of challengeQuestions) {
      let questionData = {
        isCorrect: false,
      };

      if (question.type === Types.SEQUENCE) {
        const [questionEmbed, questionDropdownRow] = makeQuestionEmbed(
          question,
          guild
        );
        await interaction.followUp({
          embeds: [questionEmbed],
          components: [questionDropdownRow],
        });
        await interaction.channel
          .awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            time: ChallengeParams.time * 1000,
          })
          .then((i) => {
            // check if correct
            i.update("Nice");
          })
          .catch(
            () =>
              (questionData = { id: question._id, time: 0, isCorrect: true })
          );
      } else if (Types.INPUTS.some((e) => e === question.type)) {
        // Create modal
        const [questionEmbed] = makeQuestionEmbed(question, guild);
        const confirmationModalRow = (state) => [
          new ActionRowBuilder().addComponents([
            new ButtonBuilder()
              .setCustomId(CONFIRM_MODAL)
              .setLabel(capitalize(iTranslate(guild, "proceed")))
              .setStyle(ButtonStyle.Success)
              .setEmoji("✔")
              .setDisabled(state),
          ]),
        ];
        const questionInteraction = await interaction.followUp({
          embeds: [questionEmbed],
          components: confirmationModalRow(false),
        });
        const questionModal = makeQuestionModal(question, guild);
        await interaction.channel
          .awaitMessageComponent({
            componentType: ComponentType.Button,
            time: 30000,
            max: 1,
          })
          .then(async (modalConfirmationInteraction) => {
            modalConfirmationInteraction.customId === CONFIRM_MODAL &&
            interaction.user.id === modalConfirmationInteraction.user.id
              ? await modalConfirmationInteraction.showModal(questionModal)
              : null;
            await modalConfirmationInteraction
              .awaitModalSubmit({
                time: ChallengeParams.time * 1000,
                filter: (modalInteraction) =>
                  modalInteraction.customId === INPUTS_ID &&
                  modalInteraction.user.id === interaction.user.id,
              })
              .then(async (modalAnswerInteraction) => {
                const submittedData = question.correct_answers.map(
                  (answerArray, index) => ({
                    term: answerArray[0],
                    expectedAnswer: answerArray[1],
                    valueReceived: modalAnswerInteraction.fields
                      .getTextInputValue(`${INPUTS_TEXT_ID}-${index}`)
                      .trim()
                      .toLowerCase(),
                  })
                );
                if (question.type === Types.INPUT) {
                  if (
                    question.correct_answers.some(
                      (e) => e === submittedData.valueReceived
                    )
                  )
                    modalAnswerInteraction.reply("CORRECT");
                  else modalAnswerInteraction.reply("INCORRECT");
                } else if (question.type === Types.SEQINP) {
                  submittedData.every(
                    (e) => e.expectedAnswer === e.valueReceived
                  )
                    ? modalAnswerInteraction.reply("Correct")
                    : modalAnswerInteraction.reply("Incorrect");
                }
              })
              .catch((e) => {
                logger.error(e);
              });
          })
          .catch(() =>
            questionInteraction.editReply({
              components: confirmationModalRow(true),
            })
          );
      }
      // Receive reply

      // Add to `challengeData`
      questionData.isCorrect
        ? challengeData.correct.push(questionData)
        : challengeData.incorrect.push(questionData);
    }
    await wait(3000);
    await interaction.followUp(
      `You ${
        PASSING_GRADE <=
        challengeData.correct.length / challengeData.correct.length +
          challengeData.incorrect.length
          ? "PASSED"
          : "FAILED"
      }`
    );
  },
};

/**
 * Function that returns both the Embed and the Action Row (Dropdown) of the question.
 * @param { Object } question - Retrieved from the Challenge database (MongoDB). Visit models/challenges.js for more info
 * @param { import('discord.js').Guild } guild - Guild from where the interaction is called. Used for language purposes (iTranslate -> 'en' || 'es')
 */
const makeQuestionEmbed = (question, guild) => [
  new EmbedBuilder()
    .setTitle(question.question)
    .setDescription(iTranslate(guild, "problem:challenge.seq.description"))
    .setFooter({
      text: iTranslate(guild, "KEY", {
        type: "Challenge",
        time: ChallengeParams.time * 1000,
        id: question._id,
      }),
    })
    // Some sequence questions may not have image. '|| null' is just in case.
    .setImage(question.image || null),
  new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(SEQUENCE_DROPDOWN_ID)
      .setPlaceholder(iTranslate(guild, "problem:challenge.seq.placeholder"))
      .setOptions(
        // Should use index as values so as to compare
        // if each question has a higher original index
        shuffle(
          question.correct_answers.map((option, index) => ({
            label: option,
            value: String(index),
          }))
        )
      )
  ),
];

const makeQuestionModal = (question, guild) => {
  const modal = new ModalBuilder().setCustomId(INPUTS_ID).setTitle("Challenge");
  const inputs = [
    JSON.parse(question.correct_answers).map((answer, index) =>
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId(`${INPUTS_TEXT_ID}-${index}`)
          .setLabel(
            iTranslate(guild, "problem:challenge.modal.label", {
              value: answer[0],
            })
          )
          .setStyle(TextInputStyle.Short)
      )
    ),
  ];
  modal.addComponents(...inputs);
  return modal;
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

async function meetsChallengeRequirements({ profileData, interaction, guild }) {
  const keyItem = await profileData.inventory.find(
    (item) => item._id.toString() == "6175f765562d1f316070f096"
  );
  if (hasActivity(interaction.user.id)) {
    await interaction.editReply(translate(guild, "PROBLEM_ONGOING"));
    return false;
  }
  if (!readyToAdvance(profileData) || !keyItem) {
    interaction.editReply(translate(guild, "PROBLEM_REQ_NOT_MET"));
    // TODO: Add a requirements hint message.
    // if (Math.random() < 0.1) interaction.followUp(translate(guild, 'PROBLEM_REQ_HINT'))
    return false;
  }
  return true;
}

const capitalize = (s) =>
  s
    .split(" ")
    .map((e) => e[0].toUpperCase() + e.slice(1, s.length).toLowerCase())
    .join(" ");
