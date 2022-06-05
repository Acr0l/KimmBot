const quizData = require('../models/quizSchema');

const quizDifficulty = {};
const loadDifficulties = async () => {
	try {
		const data = await quizData.find({});
		for (const question of data) {
			const quizId = question._id;

			quizDifficulty[quizId] = question.difficulty;
		}
	}
	catch (err) {
		console.log(err);
	}
};

const getDifficulty = async (quizId) => {
	return quizDifficulty[quizId];
};

module.exports = { loadDifficulties, getDifficulty };
