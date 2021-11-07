const express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    { createQuiz } = require('../util/constructors'),
    csvtojson = require('csvtojson');




router.get('/', (req, res) => {
    res.render('import', {
        title: 'Import Quiz',
        type: 'quiz',
        message: 'Remember that the columns MUST be subject, difficulty, question, correct_answer, incorrect_answers, [image], type, category, lang.'
    });
});

router.post('/', async (req, res) => {
    let fStream;
    req.pipe(req.busboy);
    req.busboy.on('file', (fieldname, file, filename) => {
        console.log(`Upload of '${filename}' started`);
        fStream = fs.createWriteStream(`./resources/quizUpload.csv`);
        file.pipe(fStream);
        fStream.on('close', () => {
            console.log(`Upload of '${filename}' finished`);
            res.redirect('/');
        });
    });
    const csv = await csvtojson().fromFile('./resources/quizUpload.csv');
    csv.forEach(async (row) => {
        let quiz = {};
        quiz['quizSubject'] = row['subject'];
        quiz['quizDifficulty'] = row['difficulty'];
        quiz['quizQuestion'] = row['question'];
        quiz['answerCorrect'] = row['correct_answer'];
        quiz['answerIncorrect'] = row['incorrect_answers'].split(':');
        if (row['image']) {
            quiz['quizImage'] = row['image'];
        }
        quiz['quizType'] = row['type'];
        quiz['quizCategory'] = row['category'];
        quiz['quizLang'] = row['lang'];
        createQuiz(quiz);
    });
});

module.exports = router;