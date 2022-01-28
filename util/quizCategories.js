const quizCategories = [
    {
        type: 'Warmup',
        time: 60,
        meConsumption: 2,
        /**
         *
         * @param { Number } answerTime
         * @param { Number } difficulty
         * @returns { Number }
         */
        meFormula: function (answerTime, difficulty) {
            return Math.max(
                Math.ceil(Math.log(answerTime)) * (difficulty + 2),
                4,
            );
        },
        xpFormula: function (difficulty) {
            return (
                Math.floor(Math.random() * (difficulty * 2)) +
                3 * difficulty +
                3
            );
        },
        image: {
            correct:
                'https://pixelartmaker-data-78746291193.nyc3.digitaloceanspaces.com/image/e8ba734de1b8121.png',
            incorrect:
                'https://pixelartmaker-data-78746291193.nyc3.digitaloceanspaces.com/image/d709a38e2bfc90d.png',
        },
    },
    {
        type: 'Workout',
        time: 180,
        meConsumption: 3,
        meFormula: function (answerTime, difficulty) {
            return Math.ceil(answerTime / 2 + 10) * (difficulty + 2);
        },
        xpFormula: function (difficulty) {
            return (
                Math.floor(Math.random() * (difficulty * difficulty * 5 + 15)) +
                10 * difficulty +
                5
            );
        },
        donsFormula: function (difficulty, answerTime) {
            return Math.min(
                Math.ceil(100 / (3 * answerTime)) * (difficulty + 1),
                difficulty * 15,
            );
        },
        image: {
            correct:
                'https://cdn.pixabay.com/photo/2016/03/31/14/37/check-mark-1292787__340.png',
            incorrect:
                'https://cdn.pixabay.com/photo/2012/04/12/20/12/x-30465_960_720.png',
        },
    },
    {
        type: 'Challenge',
        time: 300,
        meConsumption: 4,
        /**
         * Get time limit and quantity of problems based on difficulty
         * @param { Number } tier - Difficulty of the problem(s)
         * @param { Function } dhmsFunction - Function to convert seconds to days, hours, minutes and seconds
         * @param { String } language - Language of the problem(s)
         * @returns {{ Questions: { totalTime: { String }, number: { Number }}, Difficulty: { Object}, Time: { seconds: { Number }, time: { String }} }}
         */
        questionsTimeAndQuantity: function (tier, dhmsFunction, language) {
            return {
                Questions: {
                    totalTime: dhmsFunction(
                        this.Questions.number * this.Time.seconds,
                        language,
                    ),
                    number: Math.ceil((tier + 1) * 1.5) + 2,
                },
                Difficulty: {},
                Time: {
                    seconds: (tier + 1) * 20 + 30,
                },
                time: dhmsFunction(this.Time.seconds, language),
            };
        },
        meFormula: function () {
            return 0;
        },
        xpFormula: function (difficulty) {
            return (
                Math.floor(
                    getRandomArbitrary(0.8, 1) *
                        (Math.pow(difficulty, 3) * 7 + 15),
                ) +
                100 * difficulty +
                100
            );
        },
        image: {
            correct: 'https://i.imgur.com/0L5zVXQ.png',
            incorrect:
                'https://www.icegif.com/wp-content/uploads/sad-anime-icegif.gif', // CHANGE THIS
        },
    },
];

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

module.exports = quizCategories;
