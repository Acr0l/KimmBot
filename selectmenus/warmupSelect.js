const {
        MessageEmbed,
        MessageActionRow,
        MessageSelectMenu,
        SnowflakeUtil,
    } = require('discord.js'),
    profileModel = require('../models/profileSchema'),
    { applyXp } = require('../util/levelFunctions'),
    { translate } = require('../handlers/language'),
    { getDifficulty } = require('../handlers/difficulty'),
    mustache = require('mustache');

module.exports = {
    name: 'warmupSelect',
    description: 'Selects a warmup',
    run: async (client, interaction, profileData) => {
        const { guild } = interaction;

        let embed;

        // Get if the answer is correct.
        const value = interaction.values[0].startsWith('x');
        // Get the warmup id and subject.
        let [subject, warmupId] = interaction.values[0].split('-');
        subject = subject.slice(1);
        // Get the warmup data.
        const difficulty = await getDifficulty(warmupId);
        const answerTime = Math.floor(
            (Date.now() -
                SnowflakeUtil.deconstruct(interaction.message.id).timestamp) /
                1000,
        );
        const meSpent = Math.ceil(Math.log(answerTime)) * difficulty + 2;

        // Apply ME changes.
        if (answerTime >= 60) {
            await interaction.followUp(
                translate(guild, 'PROBLEM_SELECT_TIME_EXPIRED'),
            );
            return;
        }

        if (profileData.mentalEnergy.me - meSpent >= 0) {
            if (!profileData.stats.find((stat) => stat.subject == subject)) {
                profileData.stats.push({
                    subject: subject,
                    tier: 0,
                    correct: value ? 1 : 0,
                    incorrect: value ? 0 : 1,
                });
            } else {
                const stat = await profileData.stats.findIndex(
                    (stat) => stat.subject === subject,
                );
                profileData.stats[stat].correct += value ? 1 : 0;
                profileData.stats[stat].incorrect += value ? 0 : 1;
            }

            profileData.mentalEnergy.me -= meSpent;
            await profileModel.findOneAndUpdate(
                { _id: profileData._id },
                profileData,
            );
        } else {
            // Not enough ME
            profileData.mentalEnergy.me = 0;
            await interaction.followUp(
                mustache.render(
                    translate(guild, 'PROBLEM_SELECT_NOT_ENOUGH_ME'),
                    { meSpent },
                ),
            );
            await profileData.save();
            return;
        }
        await profileData.save();
        // Variables
        let color, title, description, image, footer;

        if (value) {
            // Correct answer
            let xp =
                Math.floor(Math.random() * (difficulty * 2)) + 3 * difficulty;
            color = '#80EA98';
            title = mustache.render(
                translate(guild, 'PROBLEM_SELECT_CORRECT_TITLE'),
                { user: interaction.user.username },
            );
            description = mustache.render(
                translate(guild, 'PROBLEM_SELECT_CORRECT_DESCRIPTION'),
                {
                    user: interaction.user.username,
                    xp,
                    meSpent,
                },
            );
            image =
                'https://freepikpsd.com/media/2019/10/correcto-incorrecto-png-7-Transparent-Images.png';
            footer = `Id: ${warmupId}`;
            // Update the user's xp
            await applyXp(profileData, xp, interaction);
        } else {
            color = '#eb3434';
            title = mustache.render(
                translate(guild, 'PROBLEM_SELECT_INCORRECT_TITLE'),
                { user: interaction.user.username },
            );
            description = mustache.render(
                translate(guild, 'PROBLEM_SELECT_INCORRECT_DESCRIPTION'),
                { meSpent },
            );
            image =
                'https://cdn.pixabay.com/photo/2012/04/12/20/12/x-30465_960_720.png';
            footer = `Id: ${warmupId}`;
        }

        // Create the embed
        embed = new MessageEmbed()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setThumbnail(image)
            .setFooter(footer);

        const rowPlaceholderAnswers = translate(
            guild,
            'PROBLEM_SELECT_ROW_PLACEHOLDER',
        ).split(':');
        let rowPH = value ? rowPlaceholderAnswers[0] : rowPlaceholderAnswers[1];
        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('warmupSelect')
                .setPlaceholder(rowPH)
                .setMinValues(0)
                .setMaxValues(1)
                .addOptions([{ label: 'nothing', value: 'nothing' }])
                .setDisabled(true),
        );

        await interaction.update({ components: [row] });
        await interaction.followUp({ embeds: [embed] });
    },
};
