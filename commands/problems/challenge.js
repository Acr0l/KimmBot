const { SlashCommandBuilder } = require('@discordjs/builders'),
    { readyToAdvance } = require('../../util/tierFunctions'),
    { translate } = require('../../handlers/language'),
    { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js'),
    mustache = require('mustache'),
    wait = require('util').promisify(setTimeout);

module.exports = {
    cooldown: 10, //86400 * 3,
    data: new SlashCommandBuilder()
        .setName('challenge')
        .setDescription('The ultimate test'),
    async execute(interaction, profileData) {
        const { guild } = interaction,
            keyItem = profileData.inventory.find(
                (item) => item._id.toString() == '6175f765562d1f316070f096',
            );
        if (!readyToAdvance(profileData) || !keyItem) {
            return interaction.reply(translate(guild, 'PROBLEM_REQ_NOT_MET'));
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
        await interaction.reply({
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

        collector.on('collect', (i) => {
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
            const test = subjectTest.slice(0, numberOfQuestions);
            i.reply({ ephemeral: true, content: test.join('\n') });
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
