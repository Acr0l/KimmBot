const {
  SelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const { iTranslate } = require("./language");
const { numberOfAlternatives, shuffleAlternatives } = require("../util/shufflers");
const { ButtonTypes } = require("../constants/problem");

const idRegEx = /^problemButton[1-9]/;

/**
 * @typedef {import('discord.js').Guild } Guild
 */

const MenuCreator = ({ guild, question, difference = 0, options }) => {
  // Randomize the alternatives.
  if (difference != 0) {
    options.alternatives = shuffleAlternatives(
      numberOfAlternatives(question) - difference,
      question
    );
  }

  // Create row with select menu
  return new SelectMenuBuilder()
    .setCustomId(`K${question.type}`)
    .setPlaceholder(iTranslate(guild, "select.alternative", { ns: "problem" }))
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(options.alternatives);
};

/**
 * Return a function, that when called will generate a Button Component to activate hint
 * @param {Guild} guild - The guild to get the language of the button
 * @returns {Function} The function will return the button component with the correct state (Disabled)
 */
const createHintButton = (guild) => {
  return (state) =>
    new ActionRowBuilder().addComponents([
      new ButtonBuilder()
        .setCustomId(ButtonTypes.GET_HINT)
        .setLabel(iTranslate(guild, "hint.request", { ns: "problem" }))
        .setStyle(ButtonStyle.Success)
        .setDisabled(state),
    ]);
};

/**
 *
 * @param {Guild | null} guild
 * @param {*} options
 * @returns {import('discord.js').ButtonBuilder[]}
 */
const createAlternativeButtons = (guild, options) => {
  const altBtnArray = [];

  for (let i = 0; i < options.alternatives.length; i++) {
    altBtnArray.push(
      new ButtonBuilder()
        .setCustomId(`problemButton${i}`)
        .setLabel(options.alternatives[i].label)
        .setStyle(ButtonStyle.Secondary)
    );
  }
  return altBtnArray;
};

/**
 *
 * @param {{question: String, subject, String, type: String, difficulty: Number, correct_answer: String, incorrect_answers: string[], category: String}} question - The question to solve.
 * @param {import('discord.js').Interaction} interaction - Interaction that triggered command
 * @param {import('discord.js').Guild | Null} guild - Server from where the interaction was sent
 * @param {*} options - Options idk
 * @returns {{cType: import('discord.js').ComponentType, filter: Function, row: import('discord.js').ActionRowBuilder}}
 */
const rowConstructor = (question, interaction, guild, options) => {
  return {
    cType:
      question.type === "T/F" ? ComponentType.Button : ComponentType.SelectMenu,
    filter: function(/** @type {{ customId: string; user: { id: any; }; }} */ i) {
      return (
        (i.customId === `K${question.type}` || idRegEx.test(i.customId)) &&
        i.user.id === interaction.user.id
      );
    },
    row: new ActionRowBuilder().addComponents(
      question.type == "T/F"
        ? createAlternativeButtons(guild, options)
        : [MenuCreator({ guild, question, options })]
    ),
  };
};
module.exports = {
  MenuCreator,
  createHintButton,
  createAlternativeButtons,
  rowConstructor,
};
