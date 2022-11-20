// TODO: Add time formatting with interpolation and plurals (i18next)

const { iTranslate } = require("../handlers/language");

/**
 * Translates time into a human readable format.
 * @param {Number} seconds Seconds to translate
 * @param {*} trGuild Guild with specific language
 * @returns {String}
 */
module.exports = {
  MIN_IN_SEC: 60,
  HALF_HOUR_IN_SEC: 1800,
  /**
   * Converts seconds to human readable text.
   * @param {Number} seconds - Integer to convert into date.
   * @param {import('discord.js').Guild | Null} trGuild - Define language to send
   * @returns {String} - Time
   */
  forHumans: function(seconds, trGuild) {
    const levels = [
      [
        Math.floor(((seconds % 31536000) % 86400) / 3600),
        iTranslate(trGuild, "hours"),
      ],
      [
        Math.floor((((seconds % 31536000) % 86400) % 3600) / 60),
        iTranslate(trGuild, "minutes"),
      ],
      [
        (((seconds % 31536000) % 86400) % 3600) % 60,
        iTranslate(trGuild, "seconds"),
      ],
    ];
    let returntext = "";

    for (let i = 0, max = levels.length; i < max; i++) {
      if (levels[i][0] === 0) continue;
      returntext +=
        " " +
        levels[i][0] +
        " " +
        // @ts-ignore
        (levels[i][0] === 1
          ? levels[i][1].substr(0, levels[i][1].length - 1)
          : levels[i][1]);
    }
    return returntext.trim();
  },
};
