const { SlashCommandBuilder } = require('@discordjs/builders'),
    { readyToAdvance } = require('../../util/tierFunctions'),
    { translate } = require('../../handlers/language'),
    { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js'),
    mustache = require('mustache'),
    { generateQuiz } = require('../../util/problemFunctions');

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
                    time: profileData.tier * 10,
                    totalTime: profileData.tier * 10,
                },
            },
            fieldTitleMap = new Map();
        for (let i = 0; i < embedFields.length; i++) {
            fieldTitleMap.set(enEmbedFields[i], embedFields[i]);
        }
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
            components: row(false),
            ephemeral: true,
        });

        const filter = (i) =>
            i.customId == 'challengeConfirm' || i.customId == 'challengeReject';
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'BUTTON',
            time: 40000,
        });

        collector.on('collect', (i) => {
            interaction.editReply({
                content: 'In progress...',
                components: row(true),
                ephemeral: true,
            });
            let statsOrdered = profileData.stats.sort(
                    (a, b) => a.tier - b.tier,
                ),
                finalOrder = [];
            for (let i = 0; i < numberOfQuestions; i++) {
                finalOrder.push(statsOrdered[i % statsOrdered.length]);
            }
            i.reply({ ephemeral: true, content: 'Fight me!' });
        });

        collector.on('end', () => {
            interaction.editReply({
                contents: 'Challenge finished or cancelled.',
                embeds: [embed],
                components: [],
            });
        });
    },
};
