const express = require('express'),
    router = express.Router(),
    { createItem, createQuiz } = require('../util/constructors');
    subjects = require('../../util/subjects.json');

const options = {
    item: [
        {
            name: 'itemName',
            placeholder: 'Item Name',
            type: 'text',
            required: true,
        },
        {
            name: 'itemType',
            label: 'Item Type',
            placeholder: 'Item Type',
            type: 'text',
            required: true,
            dropdown: true,
            options: [
                {
                    name: 0,
                    value: 'Equipment',
                },
                {
                    name: 1,
                    value: 'Consumable',
                },
                {
                    name: 2,
                    value: 'Special Consumable',
                },
                {
                    name: 3,
                    value: 'Quest',
                },
            ],
        },
        {
            name: 'itemTier',
            label: 'Item Tier',
            placeholder: 'Item Tier',
            type: 'number',
            required: true,
            dropdown: true,
            options: [
                {
                    name: 0,
                    value: 'Common',
                },
                {
                    name: 1,
                    value: 'Uncommon',
                },
                {
                    name: 2,
                    value: 'Rare',
                },
                {
                    name: 3,
                    value: 'Epic',
                },
                {
                    name: 4,
                    value: 'Legendary',
                },
                {
                    name: 5,
                    value: 'Mythic',
                },
            ],
        },
        {
            name: 'itemPrice',
            placeholder: 'Item Price',
            type: 'number',
            required: true,
        },
        {
            name: 'itemUse',
            placeholder: '<required> [optional]',
            type: 'text',
            required: false,
        },
        {
            name: 'itemPath',
            placeholder: 'dir/file.js',
            type: 'text',
            required: true,
        },
        {
            name: 'itemUnique',
            placeholder: 'Item Unique',
            type: 'checkbox',
            required: false,
        },
    ],
    quiz: [
        {
            name: 'quizSubject',
            label: 'Subject',
            placeholder: 'Subject',
            type: 'text',
            required: true,
            dropdown: true,
            options: Object.keys(subjects).map((key) => {
                return {
                    name: key,
                    value: key,
                };
            }),
        },
        {
            name: 'quizDifficulty',
            placeholder: 'Difficulty',
            type: 'number',
            min: '1',
            step: '0.01',
            required: true,
        },
        {
            name: 'quizQuestion',
            placeholder: '? for English and ¿? for Spanish',
            type: 'text',
            required: true,
        },
        {
            name: 'answerCorrect',
            placeholder: 'Correct answer',
            type: 'text',
            required: true,
        },
        {
            name: 'answerIncorrect',
            placeholder: "Incorrect answers separated by a comma ','",
            type: 'text',
            required: true,
        },
        {
            name: 'quizImage',
            placeholder: 'Imgur image link',
            type: 'url',
            required: false,
        },
        {
            name: 'quizType',
            label: 'Type',
            type: 'text',
            required: true,
            dropdown: true,
            options: [
                {
                    name: 'MC',
                    value: 'Multiple Choice',
                },
                {
                    name: 'T/F',
                    value: 'True/False',
                },
                {
                    name: 'Fill',
                    value: 'Fill in the blank',
                },
            ],
        },
        {
            name: 'quizCategory',
            label: 'Category',
            type: 'text',
            required: true,
            dropdown: true,
            options: [
                {
                    name: 'Warmup',
                    value: 'Warmup',
                },
                {
                    name: 'Workout',
                    value: 'Workout',
                },
                {
                    name: 'Challenge',
                    value: 'Challenge',
                },
                {
                    name: 'Other',
                    value: 'Other',
                },
            ],
        },
        {
            name: 'quizLang',
            label: 'Language',
            type: 'text',
            required: true,
            dropdown: true,
            options: [
                {
                    name: 'en',
                    value: 'English',
                },
                {
                    name: 'es',
                    value: 'Spanish',
                },
            ],
        },
    ],
};
let obj = {};

router.get('/', async (req, res) => {
    if (req.query.submit == 'Yes') {
        // Create item
        if (obj.item) {
            delete obj.item;
            if (createItem(obj)) {
                res.redirect('/');
            } else {
                res.send('Error creating item');
            }
        }
        // Create quiz
        else if (obj.quiz) {
            delete obj.quiz;
            if (await createQuiz(obj)) {
                res.redirect('/');
            } else {
                res.send('Error creating quiz');
            }
        }
        else {
            res.send('Error');
        }
    } else if (req.query.submit == 'No') {
        // Cancel
        console.log('Item Creation Cancelled');
        res.redirect('/');
    } else {
        res.render('menu');
    }
});

router.get('/item', async (req, res) => {
    res.render('creator', {
        items: options['item'],
        title: 'Item Creator',
        type: 'item',
    });
});

router.get('/quiz', async (req, res) => {
    res.render('creator', {
        items: options['quiz'],
        title: 'Quiz Creator',
        type: 'quiz',
    });
});

router.get('/create', (req, res) => {
    obj = req.query;
    if (obj.item) {
        let nameToDesc = obj.itemName.replace(/\s/g, '_');
        obj['itemDescription'] = `ITEM_${nameToDesc.toUpperCase()}`;
        if (obj['itemUnique']) {
            obj['itemUnique'] = true;
        } else {
            obj['itemUnique'] = false;
        }
    } else if (obj.quiz) {
        obj['answerIncorrect'] = obj['answerIncorrect'].split(':');
        if (!obj['quizImage']) {
            delete obj['quizImage'];
        }
    }
    console.log(obj);
    res.render('confirmation', { values: obj });
});


module.exports = router;
