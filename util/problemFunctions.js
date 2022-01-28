// Required variables:
const {
        MessageEmbed,
        MessageActionRow,
        MessageButton,
        MessageSelectMenu,
        SnowflakeUtil,
    } = require('discord.js'),
    { applyXp } = require('./levelFunctions'),
    quizDatabase = require('../models/quizSchema'),
    {
        setActivity,
        deleteActivity,
        hasActivity,
    } = require('../handlers/activity'),
    mustache = require('mustache'),
    { applyStatChanges } = require('./tierFunctions'),
    { translate, getLanguage } = require('../handlers/language'),
    quizCategories = require('../util/quizCategories');

// Constants
const N = 5;

/**
 * Function to get the quiz questions
 * @param { Interaction } interaction - The interaction object
 * @param { quizDatabase } profileData - The user's profile data
 * @param { Number } type - The type of quiz to generate.
 * @param { Client } client - The client object
 * @returns { Boolean } - Whether or not the quiz was handled successfully.
 */
async function generateQuiz(interaction, profileData, type, client) {
    // Defer response
    await interaction.deferReply({ ephemeral: true });
    const { guild } = interaction;

    // Check if the user can take the quiz
    if (!(await checkUser({ interaction, profileData, guild }))) return true;

    // Variables
    const subject = interaction.options.getString('subject');
    // REMOVE: Not needed, but keeping for now.
    let answerTime = 0;

    // Check if the subject is valid
    if (!(await checkValidSubject({ interaction, subject, guild })))
        return true;

    // Get the quiz question
    // [var] is to get the first element
    const [question] = await getQuizQuestion({
        interaction,
        profileData,
        type,
        subject,
        guild,
    });

    // Set activity
    setActivity(interaction.user.id, question._id);

    // Variables to store the settings
    let hintEmoji = client.emojis.cache.get('905990062095867935'),
        options = {
            alternatives: shuffleAlternatives(
                numberOfAlternatives(question),
                question,
            ),
            hint: false,
            correct_answer: question.correct_answer,
        },
        embed = quizEmbedCreator({ question, type, guild }),
        hintButton = createButton({ type: 'hint', guild, options }),
        componentInfo = createRow({
            interaction,
            question,
            guild,
            options,
        });

    //Reply
    await interaction.editReply({
        embeds: [embed],
        ephemeral: true,
        components: [componentInfo.row, hintButton(false)],
    });

    // Create message component collectors
    const collector = interaction.channel.createMessageComponentCollector({
            filter: componentInfo.filter,
            componentType: componentInfo.cType,
            time: quizCategories[type].time * 1000,
        }),
        hintCollector = interaction.channel.createMessageComponentCollector({
            filter: (i) => i.customId == 'getHint',
            componentType: 'BUTTON',
            time: (quizCategories[type].time - 3) * 1000,
            max: 1,
        });

    // Collect hint
    hintCollector.on('collect', async (i) => {
        hintHandler({
            question,
            options,
            profileData,
            guild,
            embed,
            hintEmoji,
            hintButton,
            hintCollector,
            i,
        });
    });

    // Collect the answer
    collector.on('collect', async (i) => {
        await i.deferReply();
        await interaction.editReply({
            embeds: [embed],
            ephemeral: true,
            components: [],
        });
        // Get the answer
        const [ answer ] = /^problemButton[1-9]$/.test(i.customId)
            ? options.alternatives[i.customId.match(/[1-9]/)[0]].value
            : i.values;

        answerTime = Math.floor(
            (Date.now() - SnowflakeUtil.deconstruct(i.message.id).timestamp) /
                1000,
        );

        // Return if time is up
        if (answerTime >= quizCategories[type].time) {
            interaction.followUp(
                translate(guild, 'PROBLEM_SELECT_TIME_EXPIRED'),
            );
            return;
        }
        const meSpent = quizCategories[type].meFormula(
                answerTime,
                question.difficulty,
            ),
            collectorEmbed = quizEmbedCreator(
                { question, type, guild, embedType: 'answer' },
                {
                    answer: answer === question.correct_answer,
                    interaction,
                    meSpent,
                },
            );
        // Apply the spent mental energy
        profileData = await updateMe({
            profileData,
            meSpent,
            guild,
            i,
            question,
            answer,
        });
        if (!profileData) {
            collector.stop();
            return;
        }

        if (answer === question.correct_answer) {
            // Get rewards
            const [xp, donsGained] = rewards(type, answerTime, question);
            profileData = applyXp(profileData, xp);
            profileData.dons += donsGained || 0;
        }
        // Reply
        await i.editReply({
            embeds: [collectorEmbed],
        });

        // End the interaction
        collector.stop();
    });

    collector.on('end', async (collected) => {
        let endEmbed = quizEmbedCreator({
            question,
            type,
            guild,
            embedType: 'end',
            hint: options.hint,
            emoji: hintEmoji,
        });

        await interaction.editReply({ embeds: [endEmbed], components: [] });
        // Delete activity
        deleteActivity(interaction.user.id);

        // Check if the user answered the question
        if (collected.size != 0) return;
        let meSpent = quizCategories[type].meFormula(
            answerTime,
            quizCategories[type].time * 1000,
        );
        // Apply the spent mental energy
        profileData.mentalEnergy.me = Math.max(
            0,
            profileData.mentalEnergy.me - meSpent,
        );
        interaction.followUp(
            mustache.render(translate(guild, 'PROBLEM_TIME_EXPIRED'), {
                me: profileData.mentalEnergy.me,
            }),
        );
        await profileData.save();
        hintCollector.stop();
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

/**
 * Shuffles the array and returns the alternatives in a random order.
 * @param { Number } number - Number of alternatives to be returned.
 * @param { {_id: String, subject: String, difficulty: Number, question: String, correct_answer: String, incorrect_answers: String[]} } question - Question object, with the alternatives.
 * @returns { [{label: String, value: String}, Boolean] } - Array of alternatives.
 */
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

async function checkUser({ interaction, profileData, guild }) {
    if (hasActivity(interaction.user.id)) {
        await interaction.editReply(translate(guild, 'PROBLEM_ONGOING'));
        return false;
    }
    // Check if the user has enough me
    else if (profileData.mentalEnergy.me <= 10) {
        await interaction.editReply(translate(guild, 'PROBLEM_REST'));
        return false;
    }

    return true;
}

function rewards(type, answerTime, question) {
    let ans = [];
    ans.push(quizCategories[type].xpFormula(question.difficulty));
    if (quizCategories[type].type === 'Workout')
        ans.push(
            quizCategories[type].donsFormula(question.difficulty, answerTime),
        );

    return ans;
}

async function checkValidSubject({ interaction, subject, guild }) {
    // Available subjects
    const { availableSubjects } = require('./subjects.json');
    if (availableSubjects.indexOf(subject) === -1) {
        await interaction.editReply(
            translate(guild, 'PROBLEM_SUBJECT_NOT_SUPPORTED'),
        );
        return false;
    }
    return true;
}

/**
 * Function to get questions from the database
 * @param {*} param0 - Object with the following properties:
 * @param {*} param0.interaction - The interaction object
 * @param {*} param0.profileData - Subject
 * @param { String } param0.guild - The guild
 * @param { Number } param0.type - The type of the quiz
 * @param { Number } param0.quantity - The number of questions
 * @returns { Array } - Array of questions (Boolean if no question was found)
 */
async function getQuizQuestion({
    interaction,
    subject,
    type,
    guild,
    quantity = 1,
}) {
    // Random element is stored in "question"
    // match is to filter possible questions, sample is to pick a random one.
    const question = await quizDatabase.aggregate([
        {
            $match: {
                $and: [
                    { subject },
                    { category: quizCategories[type].type },
                    { lang: getLanguage(guild) },
                ],
            },
        },
        { $sample: { size: quantity } },
    ]);
    if (!question) {
        await interaction.editReply('No questions found');
        return false;
    }
    return question;
}

/**
 * Function to create display of the question
 * @param {*} param0 - Object with the following properties:
 * @param { Question } param0.question - The question object
 * @param { Number } param0.type - The type of the quiz
 * @param { String } param0.guild - The guild language
 * @returns { Object } Embed object
 */
function quizEmbedCreator(
    {
        question,
        type = 0,
        guild,
        embedType = 'question',
        hint = false,
        emoji = '',
    },
    { answer, interaction, meSpent } = {},
) {
    if (embedType === 'question')
        return (
            new MessageEmbed()
                .setTitle(question.question)
                .setColor('#39A2A5')
                .setDescription(translate(guild, 'PROBLEM_DESCRIPTION'))
                .setFooter({
                    text: mustache.render(
                        translate(guild, 'PROBLEM_ANSWER_FOOTER'),
                        {
                            type: quizCategories[type].type,
                            time: quizCategories[type].time,
                            id: question._id,
                        },
                    ),
                })
                // REVIEW: This may fail as the image is not always present
                .setImage(question.image)
        );
    else if (embedType === 'answer')
        return new MessageEmbed()
            .setTitle(
                mustache.render(
                    translate(
                        guild,
                        `PROBLEM_SELECT_${answer ? '' : 'IN'}CORRECT_TITLE`,
                    ),
                    { user: interaction.user.username },
                ),
            )
            .setColor(answer ? '#80EA98' : '#EB3434')
            .setDescription(
                mustache.render(
                    translate(
                        guild,
                        `PROBLEM_SELECT_${
                            answer ? '' : 'IN'
                        }CORRECT_DESCRIPTION`,
                    ),
                    { meSpent },
                ),
            )
            .setFooter({
                text: `${quizCategories[type].type} id: \`${question._id}\``,
            })
            .setThumbnail(
                answer
                    ? quizCategories[type].image.correct
                    : quizCategories[type].image.incorrect,
            )
            .setAuthor({
                name: interaction.user.username,
                iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png?size=256`,
            });
    else if (embedType === 'end') {
        return new MessageEmbed()
            .setTitle(
                `${hint ? `${emoji} ` : ''}${translate(
                    guild,
                    'PROBLEM_END_TITLE',
                )}`,
            )
            .setColor('#FCDFA6')
            .setDescription(question.question)
            .setTimestamp()
            .setImage(question.image || '');
    }
}

/**
 * Creates a message action row with a button component (TODO: Add more buttons)
 * @param { * } param0 - Object with the following properties:
 * @param { String } param0.type - The type of button to create.
 * @param { String } param0.guild - The guild language
 * @param { { alternatives: [{label: String, value: String}], correct_answer: String, hint: Boolean } } param0.options - The options to create the button for.
 * @returns { MessageButton[] } - function to create a button component
 */
function createButton({ type, guild, options }) {
    if (type == 'hint') {
        return (state) =>
            new MessageActionRow().addComponents([
                new MessageButton()
                    .setCustomId('getHint')
                    .setLabel(translate(guild, 'PROBLEM_HINT_REQ'))
                    .setStyle('SUCCESS')
                    .setDisabled(state),
            ]);
    } else if (type == 'question') {
        let res = [];

        for (let i = 0; i < options.alternatives.length; i++) {
            res.push(
                new MessageButton()
                    .setCustomId(`problemButton${i}`)
                    .setLabel(options.alternatives[i].label)
                    .setStyle('SECONDARY'),
            );
        }
        return res;
    }
}

function numberOfAlternatives(question) {
    return question.incorrect_answers.length >= N - 1
        ? N
        : question.incorrect_answers.length + 1;
}

/**
 *
 * @param { Object } param0 - Object with the following properties:
 * @param { String } param0.guild - The guild language
 * @param { Number } [param0.difference] - Alternatives to subtract from the options
 * @param {{ alternatives: [{label: String, value: String}], correct_answer: String, hint: Boolean } } param0.options - The options to create the button for.
 * @returns { MessageSelectMenu } - MessageSelectMenu object
 */
function createSelectMenu({ guild, question, difference = 0, options }) {
    // Randomize the alternatives.
    if (difference != 0)
        options.alternatives = shuffleAlternatives(
            numberOfAlternatives(question) - difference,
            question,
        );

    //Create row with select menu
    return new MessageSelectMenu()
        .setCustomId(`K${question.type}`)
        .setPlaceholder(translate(guild, 'PROBLEM_SELECT_ALTERNATIVE'))
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options.alternatives);
}

/**
 *
 * @param {*} param0 - Object with the following properties:
 * @param { interaction } param0.interaction - The interaction object
 * @param { String } param0.guild - The guild language
 * @param {{ alternatives: [{label: String, value: String}], correct_answer: String, hint: Boolean } } param0.options - The options to create the button for.
 * @returns
 */
function createRow({ question, guild, interaction, options }) {
    // Create row with select menu
    return {
        cType: question.type === 'T/F' ? 'BUTTON' : 'SELECT_MENU',
        filter: function (i) {
            return (
                (i.customId === `K${question.type}` ||
                    /^problemButton[1-9]$/.test(i.customId)) &&
                i.user.id === interaction.user.id
            );
        },
        row: new MessageActionRow().addComponents(
            question.type == 'T/F'
                ? createButton({ type: 'question', guild, question, options })
                : [createSelectMenu({ guild, question, options })],
        ),
    };
}

/**
 *
 * @param {*} param0 - Object with the following properties:
 * @param { profileData } param0.profileData - The profile data object
 * @param { String } param0.guild - The guild language
 * @param { Number } param0.meSpent - The amount of mental energy spend on the quiz.
 * @param { String } param0.answer - The answer of the user.
 * @returns { profileData | false } - The profile data object or false if the ME isn't enough to answer.
 */
async function updateMe({ profileData, meSpent, guild, i, question, answer }) {
    if (profileData.mentalEnergy.me - meSpent < 0) {
        // Not enough energy
        profileData.mentalEnergy.me = 0;
        await i.editReply(
            mustache.render(translate(guild, 'PROBLEM_NOT_ENOUGH_ME'), {
                meSpent,
            }),
        );
        profileData.save();
        return false;
    }

    profileData.mentalEnergy.me -= meSpent;
    profileData = await applyStatChanges(
        profileData,
        {
            name: question.subject,
            correct: answer === question.correct_answer,
        },
        i,
    );
    return profileData;
}

async function hintHandler({
    question,
    options,
    profileData,
    guild,
    embed,
    hintEmoji,
    hintButton,
    hintCollector,
    i,
}) {
    if (question.type !== 'MC' || options.hint) return;
    // Check if the user has a hint.
    const hintInvHandler = require('../subcommands/use');
    i['item'] = 'Hint';
    hintInvHandler.execute(i, profileData);
    let rowHint = new MessageActionRow().addComponents(
            createSelectMenu({ guild, question, difference: 1, options }),
        ),
        hintEmbed = new MessageEmbed(embed).setTitle(
            `${hintEmoji} ${question.question}`,
        );
    // Set the hint as used
    options.hint = true;
    // Reply with the hint
    await i.update({
        embeds: [hintEmbed],
        ephemeral: true,
        components: [rowHint, hintButton(true)],
    });
    hintCollector.stop();
}
module.exports = {
    generateQuiz,
    numberOfAlternatives,
    shuffleAlternatives,
    checkUser,
    rewards,
    checkValidSubject,
    getQuizQuestion,
    quizEmbedCreator,
    createRow,
    createSelectMenu,
    createButton,
    updateMe,
    hintHandler,
};
