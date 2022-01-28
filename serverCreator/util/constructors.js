const itemModel = require('../../models/itemSchema'),
    quizDatabase = require('../../models/quizSchema'),
    { subjects } = require('../../util/subjects.json'),
    { languages } = require('../../resources/lang.json');

/**
 * Function to upload the item to the database.
 * @param { Object } obj - Object with the item data.
 * @param { String } obj.itemName - Name of the item.
 * @param { String } obj.itemDescription - Description of the item.
 * @param { String } obj.itemImage - Image of the item.
 * @param { Number } obj.itemType - Type of the item (0 = Equipment, 1 = Consumable, 2 = Special Consumable, 3 = Quest).
 * @param { Number } obj.itemTier - Tier of the item (0 = Common, 1 = Uncommon, 2 = Rare, 3 = Epic, 4 = Legendary).
 * @param { Number } obj.itemPrice - Price of the item.
 * @param { String } obj.itemUse - Use of the item.
 * @param { String } obj.itemPath - Path of the item.
 * @param { Boolean } obj.itemUnique - If the item is unique.
 * @returns { Boolean } - Returns true if the item was created, false if not.
 */
const createItem = async (obj) => {
    itemVerifier(obj).catch((e) => {
        console.log(e);
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

/**
 * Function to upload the quiz to the database
 * @param { Object } obj - Object with the quiz data
 * @param { String } obj.quizSubject - Subject of the quiz
 * @param { Number } obj.quizDifficulty - Difficulty of the quiz
 * @param { String } obj.quizQuestion - Question of the quiz
 * @param { String } obj.answerCorrect - Correct answer of the quiz
 * @param { String[] } obj.answerIncorrect - Incorrect answers of the quiz
 * @param { String } obj.quizImage - Image of the quiz
 * @param { String } obj.quizType - Type of the quiz
 * @param { String } obj.quizCategory - Category of the quiz
 * @param { String } obj.quizLang - Language of the quiz
 */
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

const itemVerifier = async (item) => {
    if (typeof item.itemName !== 'string') throw 'itemName is not a string';
    if (typeof item.itemDescription !== 'string') {
        throw 'itemDescription is not a string';
    } else if (
        item.itemDescription !==
        `ITEM_${item.itemName.replace(/\s/g, '_').toUpperCase()}`
    )
        throw 'itemDescription is not valid (!= ITEM_NAME)';
    if (typeof parseInt(item.itemType) !== 'number')
        throw 'itemType is not a number';
    if (typeof parseInt(item.itemTier) !== 'number')
        throw 'itemTier is not a number';
    if (typeof parseInt(item.itemPrice) !== 'number')
        throw 'itemPrice is not a number';
    if (typeof item.itemUse !== 'string') throw 'itemUse is not a string';
    if (typeof item.itemPath !== 'string') throw 'itemPath is not a string';
    if (typeof item.itemUnique !== 'boolean')
        throw 'itemUnique is not a boolean';
};

const quizVerifier = (quiz) => {
    subjectsArray = Object.keys(subjects);
    try {
        for (const key in quiz) {
            if (key === 'quizSubject') {
                if (!subjectsArray.some((e) => e === quiz[key]))
                    throw `Invalid Subject ${quiz[key]}`;
            } else if (key === 'quizDifficulty') {
                if (parseFloat(quiz[key]) < 0 || parseFloat(quiz[key]) >= 8)
                    throw 'Invalid Difficulty';
            } else if (key === 'quizQuestion') {
                if (quiz[key].length < 10) throw 'Invalid Question';
            } else if (key === 'answerCorrect') {
                if (!typeof quiz[key] === 'string')
                    throw 'Invalid Correct Answer';
            } else if (key === 'answerIncorrect') {
                if (!Array.isArray(quiz[key]))
                    throw 'Invalid Incorrect Answers (Must be an array)';
                for (const answer of quiz[key]) {
                    if (!typeof answer === 'string')
                        throw 'Invalid Incorrect Answer (Must be a string)';
                }
            } else if (key === 'quizImage') {
                if (!isValidHttpUrl(quiz[key]))
                    throw `Invalid image url: '${quiz[key]}'`;
            } else if (key === 'quizType') {
                const types = ['MC', 'T/F', 'Fill'];
                if (!types.includes(quiz[key])) throw 'Invalid Type';
            } else if (key === 'quizCategory') {
                const categories = ['Warmup', 'Workout', 'Challenge', 'Other'];
                if (!categories.includes(quiz[key])) throw 'Invalid Category';
            } else if (key === 'quizLang') {
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
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return true;
}

module.exports = { createItem, createQuiz };
