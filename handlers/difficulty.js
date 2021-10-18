const quizData = require('../models/quizSchema');

const quizDifficulty = {};
/**
 * @param { Object } client - The client object.
 */
 const loadDifficulties = async (client) => {
    try {
        const data = await quizData.find({});
        for (const question of data) {
            const quizId = question._id;

            quizDifficulty[quizId] = question.difficulty;
        }
    } catch (err) {
        console.log(err);
    }
};

/**
 * @param { String } quizId - The id of the quiz.
 */
const getDifficulty = async (quizId) => {
    return quizDifficulty[quizId];
};

module.exports = { loadDifficulties, getDifficulty };
