// Required variables:
const { MessageEmbed } = require('discord.js'),
    {
        MessageActionRow,
        MessageButton,
        MessageSelectMenu,
    } = require('discord.js'),
    { SlashCommandBuilder } = require('@discordjs/builders'),
    quizModel = require('../../models/quizSchema'),
    subjects = require('../../util/subjects.json'),
    subjectsArr = [],
    { setActivity, deleteActivity } = require('../../handlers/activity'),
    mustache = require('mustache'),
    { translate } = require('../../handlers/language');

for (const subject of Object.keys(subjects)) {
    subjectsArr.push([subject, subject]);
}

module.exports = {
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('warmup')
        .setDescription('Quick question to warm up those neurons.')
        .addStringOption((option) =>
            option
                .setName('subject')
                .setDescription('Subject to warm up')
                .setRequired(true)
                .addChoices(subjectsArr),
        ),

    async execute(interaction, profileData) {
        const { guild } = interaction;
        if (profileData.mentalEnergy.me <= 10) {
            interaction.reply(translate(guild, 'PROBLEM_REST'));
            return;
        }
        // Constants
        const N = 5;

        // Get the subject
        const subject = interaction.options.getString('subject');

        if (subject !== 'Math') {
            interaction.reply(
                translate(guild, 'PROBLEM_SUBJECT_NOT_SUPPORTED'),
            );
            return;
        }

        //First must be the correct one
        let alternativesOrdered = [];

        // Random element is stored in "question"
        // match is to filter possible questions, sample is to pick a random one.
        // [] around a variable means it is the first element of the array.
        const [question] = await quizModel.aggregate([
            {
                $match: {
                    $and: [{ subject: subject }, { category: 'Warmup' }],
                },
            },
            { $sample: { size: 1 } },
        ]);
        // Set activity
        setActivity(interaction.user.id, question._id);

        // Set number of alternatives (+ correct answer)
        const altNum =
            question.incorrect_answers.length >= N - 1
                ? N
                : question.incorrect_answers.length + 1;

        // Randomize the alternatives.
        let warmupAlternatives = [
            question.correct_answer,
            ...question.incorrect_answers,
        ]
            .slice(0, altNum)
            .sort(() => Math.random() - 0.5);

        alternativesOrdered[0] = question.correct_answer;
        for (const alt of question.incorrect_answers) {
            alternativesOrdered.push(alt);
        }

        //Create options as array of objects
        let options = [];

        for (let i = 0; i < warmupAlternatives.length; i++) {
            options[i] = {
                label: warmupAlternatives[i],
                value:
                    warmupAlternatives[i] == question.correct_answer
                        ? `x${subject}-${question._id}`
                        : `${i}${subject}-${question._id}`,
            };
        }

        //Create embed with the question
        let embed = new MessageEmbed()
            .setTitle(question.question)
            .setColor('#39A2A5')
            .setDescription(translate(guild, 'PROBLEM_DESCRIPTION'))
            .setFooter(`Warmup id: \`${question._id}\``);

        if (question.image) {
            embed.setImage(question.image);
        }

        //Create row with select menu
        const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
                .setCustomId('warmupSelect')
                .setPlaceholder(translate(guild, 'PROBLEM_SELECT_ALTERNATIVE'))
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(options),
        );

        //Reply
        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
            components: [row],
        });

        const filter = (i) => i.customId === 'warmupSelect';
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'SELECT_MENU',
            time: 60000,
        });

        collector.on('end', async (collected) => {
            // Delete activity
            deleteActivity(interaction.user.id);

            // Check if the user answered the question
            if (collected.size != 0) return;
            profileData.mentalEnergy.me = Math.max(
                0,
                profileData.mentalEnergy.me - (60 * 2 + 3),
            );
            await interaction.followUp(
                mustache.render(translate(guild, 'PROBLEM_TIME_EXPIRED'), {
                    me: profileData.mentalEnergy.me,
                }),
            );
            await profileData.save();
        });
    },
};
