// Required variables:
const { MessageEmbed } = require('discord.js'),
    {
        MessageActionRow,
        MessageButton,
        MessageSelectMenu,
        SnowflakeUtil,
    } = require('discord.js'),
    { applyXp } = require('./levelFunctions'),
    quizDatabase = require('../models/quizSchema'),
    subjects = require('./subjects.json'),
    subjectsArr = [],
    { setActivity, deleteActivity } = require('../handlers/activity'),
    mustache = require('mustache'),
    { applyStatChanges } = require('./tierFunctions'),
    { translate } = require('../handlers/language');

for (const subject of Object.keys(subjects)) {
    subjectsArr.push([subject, subject]);
}
// Constants
const N = 5;
const quizCategories = [
    {
        type: 'Warmup',
        time: 60,
        meConsumption: 2,
        meFormula: function (answerTime, difficulty) {
            return Math.ceil(Math.log(answerTime)) * difficulty + 2;
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
            return Math.ceil(answerTime / 2 + 10) * difficulty + 2;
        },
        xpFormula: function (difficulty) {
            return (
                Math.floor(Math.random() * (difficulty * difficulty * 5 + 15)) +
                10 * difficulty +
                5
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
        meFormula: function (answerTime) {
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
/**
 * Function to get the quiz questions
 * @param { Object } interaction - The interaction object
 * @param { Object } profileData - The user's profile data
 * @param { Number } type - The type of quiz to generate.
 * @returns Boolean - Whether or not the quiz was generated successfully.
 */
async function generateQuiz(interaction, profileData, type) {
    // type = 0 -> warmup - 1 -> workout - 2 -> challenge

    const { guild } = interaction;
    if (profileData.mentalEnergy.me <= 10 && type != 2) {
        interaction.reply(translate(guild, 'PROBLEM_REST'));
        return false;
    }

    let subject = 'challenge';
    // Get the subject
    if (type != 2) {
        subject = interaction.options.getString('subject');
    }

    if (subject !== 'Math' && type != 2) {
        interaction.reply(translate(guild, 'PROBLEM_SUBJECT_NOT_SUPPORTED'));
        return;
    }

    // Random element is stored in "question"
    // match is to filter possible questions, sample is to pick a random one.
    // [] around a variable means it is the first element of the array.
    const [question] = await quizDatabase.aggregate([
        {
            $match: {
                $and: [
                    { subject: subject },
                    { category: quizCategories[type].type },
                ],
            },
        },
        { $sample: { size: 1 } },
    ]);

    // Set activity
    setActivity(interaction.user.id, question._id);

    // Create embed with the question
    let embed = new MessageEmbed()
        .setTitle(question.question)
        .setColor('#39A2A5')
        .setDescription(translate(guild, 'PROBLEM_DESCRIPTION'))
        .setFooter(
            mustache.render(translate(guild, 'PROBLEM_ANSWER_FOOTER'), {
                type: quizCategories[type].type,
                time: quizCategories[type].time,
                id: question._id,
            }),
        );

    if (question.image) {
        embed.setImage(question.image);
    }

    // Variables to store the settings
    let row, compType, filter;
    // Detect question type
    if (question.type === 'MC') {
        // Multiple choice
        compType = 'SELECT_MENU';
        // Set number of alternatives (+ correct answer)
        const altNum =
            question.incorrect_answers.length >= N - 1
                ? N
                : question.incorrect_answers.length + 1;

        // Randomize the alternatives.
        let problemAlternatives = [
            question.correct_answer,
            ...question.incorrect_answers,
        ].slice(0, altNum);

        // Shuffle the alternatives
        shuffle(problemAlternatives);

        // Create options as array of objects
        let options = [];

        for (let i = 0; i < problemAlternatives.length; i++) {
            options[i] = {
                label: problemAlternatives[i],
                value: problemAlternatives[i],
            };
        }

        //Create row with select menu
        row = (state) => [
            new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId('problemSelect')
                    .setPlaceholder(
                        translate(guild, 'PROBLEM_SELECT_ALTERNATIVE'),
                    )
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(options),
            ),
        ];
        filter = (i) => i.customId === 'problemSelect';
    } else if (question.type === 'T/F') {
        // True/False
        compType = 'BUTTON';
        // Create the array of buttons
        row = (state) => [
            new MessageActionRow().addComponents([
                new MessageButton()
                    .setCustomId('problemButton')
                    .setLabel(problemAlternatives[0])
                    .setStyle('SECONDARY')
                    .setDisabled(state),
                new MessageButton()
                    .setCustomId('problemButton1')
                    .setLabel(problemAlternatives[1])
                    .setStyle('SECONDARY')
                    .setDisabled(state),
            ]),
        ];
        filter = (i) =>
            i.customId === 'problemButton' || i.customId === 'problemButton1';
    }

    //Reply
    await interaction.reply({
        embeds: [embed],
        ephemeral: true,
        components: row(false),
    });

    const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: compType,
        time: quizCategories[type].time * 1000,
    });

    // Collect the answer
    collector.on('collect', async (i) => {
        interaction.editReply({
            embeds: [embed],
            ephemeral: true,
            components: [],
        });
        // Get the answer
        let answer;
        if (i.customId === 'problemButton') {
            answer = problemAlternatives[0];
        } else if (i.customId === 'problemButton1') {
            answer = problemAlternatives[1];
        } else {
            [answer] = i.values;
        }

        const answerTime = Math.floor(
            (Date.now() - SnowflakeUtil.deconstruct(i.message.id).timestamp) /
                1000,
        );

        // Return if time is up
        if (answerTime >= 60) {
            await interaction.followUp(
                translate(guild, 'PROBLEM_SELECT_TIME_EXPIRED'),
            );
            return;
        }
        const meSpent = quizCategories[type].meFormula(
            answerTime,
            question.difficulty,
        );

        // Apply the spent mental energy
        if (profileData.mentalEnergy.me - meSpent < 0) {
            // Not enough energy
            profileData.mentalEnergy.me = 0;
            i.reply(
                mustache.render(translate(guild, 'PROBLEM_NOT_ENOUGH_ME'), {
                    meSpent,
                }),
            );
            return;
        } else {
            profileData.mentalEnergy.me -= meSpent;
            await applyStatChanges(
                profileData,
                {
                    name: subject,
                    correct: answer == question.correct_answer,
                },
                i,
            );
        }
        // Declare embed variables
        let color, title, description, image, footer;
        // Check if the answer is correct
        if (answer === question.correct_answer) {
            let xp = quizCategories[type].xpFormula(question.difficulty);
            color = '#80EA98';
            title = mustache.render(
                translate(guild, 'PROBLEM_SELECT_CORRECT_TITLE'),
                { user: interaction.user.username },
            );
            description = mustache.render(
                translate(guild, 'PROBLEM_SELECT_CORRECT_DESCRIPTION'),
                {
                    xp,
                    meSpent,
                    user: interaction.user.username,
                },
            );
            image = quizCategories[type].image.correct;
            footer = `${quizCategories[type].type} id: \`${question._id}\``;
            await applyXp(profileData, xp, i);
        } else {
            color = '#eb3434';
            title = mustache.render(
                translate(guild, 'PROBLEM_SELECT_INCORRECT_TITLE'),
                { user: interaction.user.username },
            );
            description = mustache.render(
                translate(guild, 'PROBLEM_SELECT_INCORRECT_DESCRIPTION'),
                {
                    meSpent,
                },
            );
            image = quizCategories[type].image.incorrect;
            footer = `${quizCategories[type].type} id: \`${question._id}\``;
        }
        const collectorEmbed = new MessageEmbed()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setThumbnail(image)
            .setFooter(footer);

        // Reply
        await i.reply({
            embeds: [collectorEmbed],
        });
        // End the interaction
        await profileData.save();
    });

    collector.on('end', async (collected) => {
        interaction.editReply({ embeds: [embed], components: [] });
        // Delete activity
        deleteActivity(interaction.user.id);

        // Check if the user answered the question
        if (collected.size != 0) return;
        let meSpent = quizCategories[type].meFormula(
            quizCategories[type].time * 1000,
        );
        // Apply the spent mental energy
        profileData.mentalEnergy.me =
            profileData.mentalEnergy.me - meSpent < 0
                ? 0
                : profileData.mentalEnergy.me - meSpent;
        await interaction.followUp(
            mustache.render(translate(guild, 'PROBLEM_TIME_EXPIRED'), {
                me: profileData.mentalEnergy.me,
            }),
        );
        await profileData.save();
    });
}

function shuffle(array) {
    let currentIndex = array.length,
        randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

module.exports = { generateQuiz };
