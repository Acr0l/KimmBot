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
    { translate, getLanguage } = require('../handlers/language');

for (const subject of Object.keys(subjects)) {
    subjectsArr.push([subject, subject]);
}
// Constants
let N = 5;
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
 * @param {*} client - The client object
 * @returns { Boolean } - Whether or not the quiz was generated successfully.
 */
async function generateQuiz(interaction, profileData, type, client) {
    // type = 0 -> warmup - 1 -> workout

    const { guild } = interaction;

    // Check if the user has enough me
    if (profileData.mentalEnergy.me <= 10) {
        interaction.reply(translate(guild, 'PROBLEM_REST'));
        return false;
    }

    // Get the subject
    const subject = interaction.options.getString('subject');

    // Available subjects
    if (subject !== 'Math') {
        interaction.reply(translate(guild, 'PROBLEM_SUBJECT_NOT_SUPPORTED'));
        return false;
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
                    { lang: getLanguage(guild) },
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
            ),
        hintButton = (state) =>
            new MessageActionRow().addComponents([
                new MessageButton()
                    .setCustomId('getHint')
                    .setLabel(translate(guild, 'PROBLEM_HINT_REQ'))
                    .setStyle('SUCCESS')
                    .setDisabled(state),
            ]);

    if (question.image) {
        embed.setImage(question.image);
    }

    // Variables to store the settings
    let row,
        compType,
        filter,
        altNum,
        hintFilter = (i) => i.customId == 'getHint',
        hintEmoji = client.emojis.cache.get('905990062095867935'),
        hintUsed = false,
        rowSelectMenu;
    // Detect question type
    if (question.type === 'MC') {
        // Multiple choice
        compType = 'SELECT_MENU';
        // Set number of alternatives (+ correct answer)
        altNum =
            question.incorrect_answers.length >= N - 1
                ? N
                : question.incorrect_answers.length + 1;

        // Randomize the alternatives.
        let options = shuffleAlternatives(altNum, question);

        //Create row with select menu
        rowSelectMenu = new MessageSelectMenu()
            .setCustomId('problemSelect')
            .setPlaceholder(translate(guild, 'PROBLEM_SELECT_ALTERNATIVE'))
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(options);
        row = new MessageActionRow().addComponents(rowSelectMenu);
        filter = (i) =>
            i.customId === 'problemSelect' && i.user.id === interaction.user.id;
    } else if (question.type === 'T/F') {
        // True/False
        compType = 'BUTTON';
        // Create the array of buttons
        row = new MessageActionRow().addComponents([
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
        ]);
        filter = (i) =>
            (i.customId === 'problemButton' ||
                i.customId === 'problemButton1') &&
            i.user.id === interaction.user.id;
    }

    //Reply
    await interaction.reply({
        embeds: [embed],
        ephemeral: true,
        components: [row, hintButton(false)],
    });

    const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: compType,
            time: quizCategories[type].time * 1000,
            max: 2,
        }),
        hintCollector = interaction.channel.createMessageComponentCollector({
            hintFilter,
            componentType: 'BUTTON',
            time: (quizCategories[type].time - 3) * 1000,
            max: 1,
        });

    // Collect hint
    hintCollector.on('collect', async (i) => {
        if (question.type !== 'MC') {
            return;
        }
        // Check if the user has a hint.
        const hintInvHandler = require('../subcommands/use');
        i['item'] = 'Hint';
        hintInvHandler.execute(i, profileData);
        options = shuffleAlternatives(altNum - 1, question);
        rowHint = new MessageActionRow().addComponents(
            rowSelectMenu.setOptions(options),
        );
        let hintEmbed = new MessageEmbed(embed).setTitle(
            `${hintEmoji} ${question.question}`,
        );
        // Set the hint as used
        hintUsed = true;
        // Reply with the hint
        i.update({
            embeds: [hintEmbed],
            ephemeral: true,
            components: [rowHint, hintButton(true)],
        });
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
            // Get rewards
            let [xp, donsGained] = rewards(type, answerTime, question);
            if (donsGained) {
                profileData.dons += donsGained;
            } else donsGained = 0;
            // Build embed
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
                    dons: donsGained,
                },
            );
            image = quizCategories[type].image.correct;
            footer = `${quizCategories[type].type} id: \`${question._id}\``;
            // Apply rewards
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
            .setAuthor(
                interaction.user.username,
                'https://cdn.discordapp.com/avatars/' +
                    profileData.userID +
                    '/' +
                    interaction.user.avatar +
                    '.jpeg',
            )
            .setTitle(title)
            .setDescription(description)
            .setThumbnail(image)
            .setFooter(footer);

        // Reply
        i.reply({
            embeds: [collectorEmbed],
        });
        // End the interaction
        await profileData.save();
    });

    collector.on('end', async (collected) => {
        embed = new MessageEmbed()
            .setColor('#FCDFA6')
            .setTitle(
                `${hintUsed ? `${hintEmoji} ` : ''}${translate(
                    guild,
                    'PROBLEM_END_TITLE',
                )}`,
            )
            .setDescription(`\`${question.question}\``);
        if (question.image) {
            embed.setImage(question.image);
        }
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

function shuffleAlternatives(number, question) {
    let alternatives = [],
        options = [];
    for (let i = 0; i < number; i++) {
        if (i === 0) {
            alternatives.push(question.correct_answer);
        } else {
            alternatives.push(question.incorrect_answers[i - 1]);
        }
    }
    alternatives = shuffle(alternatives);

    for (let i = 0; i < alternatives.length; i++) {
        options[i] = {
            label: alternatives[i],
            value: alternatives[i],
        };
    }

    return options;
}

function rewards(type, answerTime, question) {
    let ans = [];
    ans.push(quizCategories[type].xpFormula(question.difficulty));
    if (quizCategories[type].type === 'Workout') {
        ans.push(quizCategories[type].donsFormula(question.difficulty, answerTime));
    }
    return ans;
}
module.exports = { generateQuiz };
