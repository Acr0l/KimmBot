// Required variables:
const { SlashCommandBuilder } = require('@discordjs/builders'),
    subjects = require('../../util/subjects.json'),
    subjectsArr = [],
    { generateQuiz } = require('../../util/problemFunctions');

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
        if (!generateQuiz(interaction, profileData, 0)){
            console.log('Error generating quiz');
        };
    },
};
