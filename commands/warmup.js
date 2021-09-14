const { SlashCommandBuilder } = require('@discordjs/builders');
const languageQuestions = ["What's the 3rd letter of 'Banana'"];
const languageAnswers =   ["n"]
const historyQuestions = ["Is holanda a country?","What's the Netherlands capital city?","What happens to Lupita?"];
const historyAnswers   = ["No","Amsterdam","Idk"];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warmup')
        .setDescription('Quick question to warm that neurons up')
        .addIntegerOption(option =>
            option.setName('subject')
                .setDescription('Subject to warm up')
                .setRequired(true)
                .addChoice('Math', 1)
                .addChoice('Language', 2)
                .addChoice('History and Geography', 3)
                .addChoice('Sciences', 4)
                .addChoice('Computer Sciences', 5)
                .addChoice('Life Skills', 6)
                .addChoice('Musical Theory *HIGHLY RECOMMENDED*', 7)
                ),
    async execute(interaction) {
        const subject = interaction.options.getInteger('subject');        
        
        let currQuestion;
        let currAnswer;

        if      (subject == 1){currQuestion = "[Insert Math Question]"}

        else if (subject == 2){
            const indexQuestion = Math.trunc(Math.random() * (languageQuestions.length + 1));
            currQuestion = languageQuestions[indexQuestion];
            currAnswer = languageAnswers[indexQuestion];
        }

        else if (subject == 3){
            const indexQuestion = Math.trunc(Math.random() * (historyQuestions.length + 1));
            currQuestion = historyQuestions[indexQuestion];
            currAnswer = historyAnswers[indexQuestion];
        }

        else {
            currQuestion = "Still developing this subject, try another :D"
        }

        
        await interaction.reply(currQuestion);
    },
};