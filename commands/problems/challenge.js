const { SlashCommandBuilder } = require('@discordjs/builders'),
    { readyToAdvance } = require('../../util/tierFunctions'),
    { translate, getLanguage } = require('../../handlers/language'),
    quizDatabase = require('../../models/quizSchema'),
    { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js'),
    {
        setActivity,
        deleteActivity,
        hasActivity,
    } = require('../../handlers/activity'),
    mustache = require('mustache'),
    wait = require('util').promisify(setTimeout);

module.exports = {
    cooldown: 10, //86400 * 3,
    data: new SlashCommandBuilder()
        .setName('challenge')
        .setDescription('The ultimate test'),
    async execute(interaction, profileData) {
        await interaction.deferReply({ ephemeral: true });
        const { guild } = interaction,
            keyItem = profileData.inventory.find(
                (item) => item._id.toString() == '6175f765562d1f316070f096',
            );
        if (hasActivity(interaction.user.id))
            return await interaction.editReply(
                translate(guild, 'PROBLEM_ONGOING'),
            );
        if (!readyToAdvance(profileData) || !keyItem) {
            return interaction.editReply(
                translate(guild, 'PROBLEM_REQ_NOT_MET'),
            );
        }
        const numberOfQuestions = Math.ceil((profileData.tier + 1) * 1.5) + 2,
            secondsPerQuestion = (profileData.tier + 1) * 20 + 30,
            embedFields = translate(guild, 'CHALLENGE_START_FIELDS').split(':'),
            enEmbedFields = translate(
                { id: 'en' },
                'CHALLENGE_START_FIELDS',
            ).split(':'),
            row = (state) => [
                new MessageActionRow().addComponents([
                    new MessageButton()
                        .setCustomId('challengeConfirm')
                        .setLabel(translate(guild, 'YES'))
                        .setStyle('DANGER')
                        .setEmoji('✔')
                        .setDisabled(state),
                    new MessageButton()
                        .setCustomId('challengeReject')
                        .setLabel('No')
                        .setStyle('DANGER')
                        .setEmoji('❌')
                        .setDisabled(state),
                ]),
            ],
            propertiesObject = {
                Questions: { number: numberOfQuestions },
                Difficulty: {},
                Time: {
                    time: forHumans(secondsPerQuestion, guild),
                },
            },
            fieldTitleMap = new Map();
        for (let i = 0; i < embedFields.length; i++) {
            fieldTitleMap.set(enEmbedFields[i], embedFields[i]);
        }
        propertiesObject.Time['totalTime'] = forHumans(
            secondsPerQuestion * propertiesObject.Questions.number,
            guild,
        );
        const embed = new MessageEmbed()
            .setTitle(translate(guild, 'CHALLENGE_START_TITLE'))
            .setDescription(translate(guild, 'CHALLENGE_START_DESC'))
            .addFields(
                enEmbedFields.map((field) => ({
                    name: fieldTitleMap.get(field),
                    value: mustache.render(
                        translate(
                            guild,
                            `CHALLENGE_START_F_${field.toUpperCase()}`,
                        ),
                        propertiesObject[field],
                    ),
                })),
            );
        // mustache.render(translate(guild, 'CHALLENGE_START_QUESTION_NUMBER'), {number: numberOfQuestions}), translate(guild, 'CHALLENGE_START_QUESTION_DESC');
        await interaction.editReply({
            content: mustache.render(translate(guild, 'CONFIRM')),
            embeds: [embed],
            ephemeral: true,
        });
        await wait(10000);
        interaction.editReply({
            content: mustache.render(translate(guild, 'CONFIRM')),
            embeds: [embed],
            components: row(false),
            ephemeral: true,
        });
        const filter = (i) =>
            i.customId == 'challengeConfirm' || i.customId == 'challengeReject';
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'BUTTON',
            time: 50000,
            max: 1,
        });

        collector.on('collect', async (i) => {
            if (i.customId == 'challengeReject') {
                collector.stop('rejected');
                return;
            }
            interaction.editReply({
                content: 'In progress...',
                components: row(true),
                ephemeral: true,
            });
            let orderByTier = new Map();
            for (const subject of profileData.stats) {
                if (orderByTier.has(subject.tier)) {
                    let tmp = orderByTier.get(subject.tier);
                    tmp.push(subject.subject);
                    orderByTier.set(subject.tier, tmp);
                } else {
                    orderByTier.set(subject.tier, [subject.subject]);
                }
            }
            let subjectTest = [];
            for (const [tier, subjects] of orderByTier) {
                if (tier != profileData.tier && tier != profileData.tier + 1)
                    continue;
                for (const subject of subjects) {
                    subjectTest.push(subject);
                }
            }
            if (subjectTest.length < numberOfQuestions) {
                subjectTest = subjectTest.concat(subjectTest);
            }
            const test = subjectTest.slice(0, numberOfQuestions),
                questions = test.map(async (subject) => {
                    return ([subject] = await quizDatabase.aggregate([
                        {
                            $match: {
                                $and: [
                                    {
                                        subject: subject,
                                    },
                                    {
                                        difficulty: profileData.tier,
                                    },
                                    {
                                        lang: getLanguage(guild),
                                    },
                                ],
                            },
                        },
                        {
                            $sample: {
                                size: 1,
                            },
                        },
                    ]));
                });
            interaction.editReply({
                content: 'In progress...',
                components: row(true),
                ephemeral: true,
            });
            let results = 0;
            for (const question of questions) {
                results = (await makeQuestion(
                    question,
                    i,
                    profileData,
                    secondsPerQuestion,
                ))
                    ? results + 1
                    : results;
                await wait(secondsPerQuestion * 1000);
            }
            i.reply({ ephemeral: true, content: test.join('\n') });
            collector.stop();
        });

        collector.on('end', (collected) => {
            interaction.editReply({
                contents: `Challenge ${collected}.`,
                embeds: [embed],
                components: [],
            });
        });
    },
};

/**
 * Translates seconds into human readable format of seconds, minutes, hours, days, and years
 *
 * @param  {number} seconds The number of seconds to be processed
 * @return {string}         The phrase describing the amount of time
 */
function forHumans(seconds, trGuild) {
    let levels = [
        [
            Math.floor(((seconds % 31536000) % 86400) / 3600),
            translate(trGuild, 'hours'),
        ],
        [
            Math.floor((((seconds % 31536000) % 86400) % 3600) / 60),
            translate(trGuild, 'minutes'),
        ],
        [
            (((seconds % 31536000) % 86400) % 3600) % 60,
            translate(trGuild, 'seconds'),
        ],
    ];
    let returntext = '';

    for (let i = 0, max = levels.length; i < max; i++) {
        if (levels[i][0] === 0) continue;
        returntext +=
            ' ' +
            levels[i][0] +
            ' ' +
            (levels[i][0] === 1
                ? levels[i][1].substr(0, levels[i][1].length - 1)
                : levels[i][1]);
    }
    return returntext.trim();
}

/**
 * Display the question.
 * @param { Object } question - Question object
 * @param { String } question.question - Question text
 * @param { String } question._id - Question ID
 * @param { String } question.image - Image of the question
 * @param { String } question.correct_answer - Correct answer
 * @param { String } question[].incorrect_answers - Incorrect answers
 * @param { MessageComponent } interaction - The interaction message
 * @param { Object } profileData - Data from the user.
 * @return { Boolean } - True if the question was answered correctly, false otherwise.
 */
async function makeQuestion(question, interaction, profileData, time) {
    setActivity(interaction.user.id, question._id);
    const embed = new MessageEmbed()
        .setTitle(question.question)
        .setDescription(translate(guild, 'PROBLEM_DESCRIPTION'))
        .setFooter(
            mustache.render(translate(guild, 'PROBLEM_ANSWER_FOOTER'), {
                type: 'Challenge',
                time: time,
                id: question._id,
            }),
        );
    if (question.image) {
        embed.setImage(question.image);
    }

    const row = getRow(question);
    let filter = (i) =>
        i.customId == 'challengeAnswer' && interaction.user.id == i.user.id;
    if (!row) {
        // Input
        filter = (i) => interaction.user.id == i.user.id;
        interaction.channel
            .awaitMessages({ filter, time: time * 1000, max: 1 })
            .then(async (collected) => {
                const answer = collected.first().content;
                if (
                    answer.toLowerCase() ==
                    question.correct_answer.toLowerCase()
                ) {
                    interaction.editReply({
                        content: translate(guild, 'CORRECT'),
                        components: [],
                        embeds: [embed],
                    });
                    return true;
                } else {
                    interaction.editReply({
                        content: translate(guild, 'INCORRECT'),
                        components: [],
                        embeds: [embed],
                    });
                    return false;
                }
            })
            .catch(() => {
                interaction.editReply({
                    content: translate(guild, 'PROBLEM_TIME_EXPIRED'),
                    components: [],
                    embeds: [embed],
                });
                return false;
            });
    } else {
        // Sequence
        let scoreWithEmojis = [],
            counter = 0,
            answers = question.correct_answer.split(':');
        for (let i = 0; i < question.correct_answer.length; i++) {
            scoreWithEmojis.push('⚫');
        }
        row = new MessageSelectMenu()
            .setCustomId('challengeAnswer')
            .setPlaceholder(translate(guild, 'PROBLEM_SELECT_PLACEHOLDER'))
            .setMinValues(1)
            .setMaxValues(1)
            .setOptions(row);
        interaction.editReply({
            content: scoreWithEmojis.join(' '),
            embeds: [embed],
            components: [row],
        });

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'SELECT_MENU',
            time: time * 1000,
        });
        collector.on('collect', (i) => {
            const [answer] = i.values;
            if (answer == answers[counter]) {
                scoreWithEmojis[counter] = '🟢';
            } else {
                scoreWithEmojis[counter] = '🔴';
                i.update({
                    content: scoreWithEmojis.join(' '),
                    embeds: [embed],
                    components: [],
                });
                collector.stop();
                return false;
            }
            i.update({
                content: scoreWithEmojis.join(' '),
                embeds: [embed],
                components: [row],
            });
            counter++;
            if (counter == question.correct_answer.length) {
                collector.stop();
            }
        });
        collector.on('end', (collected) => {
            // Disable the ActionRow
            if (collected.size == 0) {
                interaction.editReply({
                    content: translate(guild, 'PROBLEM_TIME_EXPIRED'),
                    components: [],
                    embeds: [],
                });
            } else if (scoreWithEmojis.includes('🔴')) {
                interaction.editReply({
                    content: translate(guild, 'PROBLEM_SELECT_ROW_PLACEHOLDER'.split(':')[1]),
                    components: [],
                    embeds: []
                });
                return false;
            } else {
                interaction.editReply({
                    content: translate(guild, 'PROBLEM_SELECT_ROW_PLACEHOLDER'.split(':')[0]),
                    components: [],
                    embeds: [],
                });
                return true;
            }
        });
    }
}

function getRow(question) {
    // Types: INP (Input), SEQ (Sequence).
    // Input:
    if (question.type == 'INP') {
        // Create message collector.
        return false;
    } else if (question.type == 'SEQ') {
        // Create sequence.
        return shuffle(question.correct_answer.split(':')).map((answer) => {
            return {
                label: answer,
                value: answer,
            };
        });
    }
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
