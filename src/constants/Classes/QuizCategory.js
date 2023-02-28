// The minimum amount to spend for ME
const BASE = 4;
const { forHumans } = require("../../util/time");

/**
 * @class QuizCategory
 * @public
 * @readonly
 */
class QuizCategory {
  /**
   * Build the basic structure of the Category.
   * @param { ('WarmUp'|'Workout'|'Challenge')} type - The category of the question
   * @param { Number } timeToAnswer - The number of milliseconds the user has to answer each question.
   * @param { Number } meConsumption - A constant to decide the consumption of ME, applied in the formulas.
   * @param { Number } xpGainConstant - Same as above but for XP gain.
   * @param { { correct: string, incorrect: string}} image - URLs of the images to display in the embed
   */
  constructor(type, timeToAnswer, meConsumption, xpGainConstant, image) {
    this.type = type;
    this.time = timeToAnswer / 1000;
    this.meConsumption = meConsumption;
    this.xpGainConstant = xpGainConstant;
    this.correctImage = image.correct;
    this.incorrectImage = image.incorrect;
    this._questionAmount = 1;
  }
  get questionAmount() {
    return this._questionAmount;
  }
  set questionAmount(n) {
    if (n <= 0) {
      throw new Error(
        "The number of questions must be greater than 0, received " + n
      );
    }
    if (!Number.isInteger(n))
      throw new Error("The number of questions must be an integer, got " + n);
    this._questionAmount = n;
  }
  /**
   * Convert milliseconds to human-readable words.
   * @param { import('discord.js').Guild } guild
   * @returns {String}
   */
  humanTime(guild) {
    return forHumans(this.time, guild);
  }
  /**
   * Convert milliseconds to human-readable words.
   * @param { import('discord.js').Guild } guild
   * @returns {String}
   */
  humanTotalTime(guild) {
    return forHumans(this.totalTime, guild);
  }
  get totalTime() {
    return this._questionAmount * this.time;
  }
  // #region Formulas
  /**
   * Get the amount of ME spent by the user when answering the question.
   * @param { Number } time - Time taken to answer, in milliseconds.
   * @param { Number } diff - The difficulty of the question answered, from the DB.
   * @returns { Number } - The amount of ME to deduct from the user.
   */
  meFormula(time, diff) {
    return Math.max(
      Math.ceil(Math.log2(time) * (diff + BASE) * this.meConsumption),
      BASE * this.meConsumption
    );
  }
  /**
   * Get the amount of XP gained by the user when answering the question.
   * @param { Number } diff - The difficulty of the question answered, from the DB.
   * @returns { Number } - The amount of XP to add to the user.
   */
  xpFormula(diff) {
    return (
      Math.floor(Math.random() * (diff + BASE) * this.xpGainConstant) +
      this.xpGainConstant * BASE
    );
  }
  // #endregion
}

module.exports = QuizCategory;
