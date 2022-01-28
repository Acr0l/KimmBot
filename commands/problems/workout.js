const { SlashCommandBuilder } = require('@discordjs/builders'),
    { subjects } = require('../../util/subjects.json'),
    subjectsArr = [],
    { generateQuiz } = require('../../util/problemFunctions');

for (const subject of Object.keys(subjects)) {
    subjectsArr.push([subject, subject]);
}
module.exports = {
    cooldown: 5, //3600,
    data: new SlashCommandBuilder()
        .setName('workout')
        .setDescription('Test to train your brain and gain experience.')
        .addStringOption((option) =>
            option
                .setName('subject')
                .setDescription('Subject to exercise')
                .setRequired(true)
                .addChoices(subjectsArr),
        ),
    async execute(interaction, profileData, client) {
        if (!generateQuiz(interaction, profileData, 1, client)) {
            console.log('No problems found.');
        }
    },
};
