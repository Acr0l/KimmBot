const QuizCategory = require("./Classes/QuizCategory");

const Challenge = new QuizCategory("Challenge", 30000, 0, 0, {
  correct: "https://i.imgur.com/0L5zVXQ.png",
  // TODO: DON'T CHANGE THIS
  incorrect: "https://www.icegif.com/wp-content/uploads/sad-anime-icegif.gif",
});

/**
 * @type {Map<String, import('./Classes/QuizCategory')>}
 */
const CategoryMap = new Map();
CategoryMap.set(Challenge.type, Challenge);

module.exports = CategoryMap;
