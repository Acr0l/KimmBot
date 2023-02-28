const itemModel = require("../../models/itemSchema"),
  quizDatabase = require("../../models/quizSchema"),
  challengeDatabase = require("../../models/challenges"),
  { subjects } = require("../../util/subjects.json"),
  { languages } = require("../../resources/lang.json");

const createItem = async (obj) => {
  itemVerifier(obj).catch((e) => {
    console.log(e);
    // @ts-ignore
    exit(1);
  });

  try {
    const item = await itemModel.create({
      name: obj.itemName,
      description: obj.itemDescription,
      iType: obj.itemType,
      tier: obj.itemTier,
      price: obj.itemPrice,
      use: obj.itemUse,
      funcPath: obj.itemPath,
      unique: obj.itemUnique,
    });
    item.save();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const createQuiz = async (obj) => {
  try {
    quizVerifier(obj);
  } catch (e) {
    console.log(e);
    return;
  }
  try {
    const quiz = await quizDatabase.create({
      subject: obj.quizSubject,
      difficulty: parseFloat(obj.quizDifficulty),
      question: obj.quizQuestion,
      correct_answer: obj.answerCorrect,
      incorrect_answers: obj.answerIncorrect,
      image: obj.quizImage,
      type: obj.quizType,
      category: obj.quizCategory,
      lang: obj.quizLang,
    });
    quiz.save();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

/**
 * @param { Object } challenge - The question (challenge) to upload.
 * @param { String } challenge.subject
 * @param { Number } challenge.tier
 * @param { Number } challenge.difficulty
 * @param { [String] } challenge.question
 * @param { [String] } challenge.correct_answers
 * @param { String } challenge.image
 * @param { String } challenge.type
 * @param { String } challenge.lang
 */
const createChallenge = async (challenge) => {
  try {
    const challengeDoc = await challengeDatabase.create(challenge);
    challengeDoc.save();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const itemVerifier = async (item) => {
  if (typeof item.itemName !== "string") throw "itemName is not a string";
  if (typeof item.itemDescription !== "string")
    throw "itemDescription is not a string";
  else if (
    item.itemDescription !==
    `ITEM_${item.itemName.replace(/\s/g, "_").toUpperCase()}`
  )
    throw "itemDescription is not valid (!= ITEM_NAME)";

  if (typeof parseInt(item.itemType) !== "number")
    throw "itemType is not a number";

  if (typeof parseInt(item.itemTier) !== "number")
    throw "itemTier is not a number";

  if (typeof parseInt(item.itemPrice) !== "number")
    throw "itemPrice is not a number";

  if (typeof item.itemUse !== "string") throw "itemUse is not a string";
  if (typeof item.itemPath !== "string") throw "itemPath is not a string";
  if (typeof item.itemUnique !== "boolean") throw "itemUnique is not a boolean";
};

const quizVerifier = (quiz) => {
  const subjectsArray = Object.keys(subjects);
  try {
    for (const key in quiz) {
      if (key === "quizSubject") {
        if (!subjectsArray.some((e) => e === quiz[key]))
          throw `Invalid Subject ${quiz[key]}`;
      } else if (key === "quizDifficulty") {
        if (parseFloat(quiz[key]) < 0 || parseFloat(quiz[key]) >= 8)
          throw "Invalid Difficulty";
      } else if (key === "quizQuestion") {
        if (quiz[key].length < 10) throw "Invalid Question";
      } else if (key === "answerCorrect") {
        // @ts-ignore
        // eslint-disable-next-line no-constant-condition
        if (!typeof quiz[key] === "string") throw "Invalid Correct Answer";
      } else if (key === "answerIncorrect") {
        if (!Array.isArray(quiz[key]))
          throw "Invalid Incorrect Answers (Must be an array)";

        for (const answer of quiz[key]) {
          // @ts-ignore
          // eslint-disable-next-line no-constant-condition
          if (!typeof answer === "string")
            throw "Invalid Incorrect Answer (Must be a string)";
        }
      } else if (key === "quizImage") {
        if (!isValidHttpUrl(quiz[key]))
          throw `Invalid image url: '${quiz[key]}'`;
      } else if (key === "quizType") {
        const types = ["MC", "T/F", "Fill"];
        if (!types.includes(quiz[key])) throw "Invalid Type";
      } else if (key === "quizCategory") {
        const categories = ["Warmup", "Workout", "Challenge", "Other"];
        if (!categories.includes(quiz[key])) throw "Invalid Category";
      } else if (key === "quizLang") {
        if (!languages.includes(quiz[key]))
          throw `Invalid language ${quiz[key]}`;
      }
    }
  } catch (e) {
    console.log(e);
    return;
  }
};

function isValidHttpUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }

  return true;
}

module.exports = { createItem, createQuiz, createChallenge };
