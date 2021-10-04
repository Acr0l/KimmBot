const { SlashCommandBuilder } = require('@discordjs/builders');
const { subjects } = require('../../util/subjects');

let subjectsArr = [];

for (const subject of subjects)
{
    subjectsArr.push([subject.name, subject.name])
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`suggest`)
        .setDescription(`Suggest questions to the bot, you may get a title after getting many questions approved.`)
        .addStringOption(option => 
            option.setName(`subject`)
                .setDescription(`The subject of the suggestion.`)
                .setRequired(true)
                .addChoices(subjectsArr)
        )
        .addStringOption(option =>
            option.setName('suggestion')
                .setDescription('Write here the question you would like to suggest.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('correctans')
                .setDescription('Write here the correct answer to your question.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('incorrectans')
                .setDescription('Write here the incorrect answers, separated by a coma (,).')
                .setRequired(true)
        ),

  /**
    * @param { Object } interaction - Object with the interaction data sent by the user.
    * @param { Object } profileData - Object from the database with the user profile data.
    * @param { Object } client - The discord.js client object.
    */
    async execute(interaction, profileData, client) {
        // if (await DBLIST.findOne(interaction.user.id)) return interaction.reply('You are not allowed to use this command.')
        // Build embed (TODO)
        const suggestionSubject = interaction.options.getString('subject');
        const suggestion = interaction.options.getString('suggestion');
        const correctAnswer = interaction.options.getString('correctans');
        const incorrectAnswers = interaction.options.getString('incorrectans').split(',');

        client.channels.cache.get('894728345235914802')
            .send(`**Suggestion**\nUser: ${interaction.user.tag}, User ID \`${interaction.user.id}\`\n${suggestionSubject}: ${suggestion}\n**Correct:** ${correctAnswer}\n**Incorrect:** ${incorrectAnswers}`);
        interaction.reply(`Your suggestion has been sent to the bot, thanks for your support!`);
    }
}
