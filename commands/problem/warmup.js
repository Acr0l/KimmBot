// Required variables:
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const quizModel = require('../../models/quizSchema');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('warmup')
        .setDescription('Quick question to warm those neurons up.')
        .addStringOption(option =>
            option.setName('subject')
                .setDescription('Subject to warm up')
                .setRequired(true)
                .addChoice('Math', 'Math')
        ),

    async execute(interaction, profileData) {

        // Constants
        const N = 5;

        // Get the subject
        const subject = interaction.options.getString('subject');

        //First must be the correct one
        let alternativesOrdered = [];

        // Random element is stored in "question"
        // match is to filter possible questions, sample is to pick a random one.
        // [] around a variable means it is the first element of the array.
        const [question] = await quizModel.aggregate([{ $match: { $and: [{ subject: subject }, { category: "Warmup" }] } }, { $sample: { size: 1 } }]);

        // Set number of alternatives (+ correct answer)
        const altNum = question.incorrect_answers.length >= N - 1 ? N : question.incorrect_answers.length + 1;
        
        // Randomize the alternatives.
        let warmupAlternatives = [question.correct_answer, ...question.incorrect_answers].slice(0, altNum).sort(() => Math.random() - 0.5);

        alternativesOrdered[0] = question.correct_answer;
        for (const alt of question.incorrect_answers) {
            alternativesOrdered.push(alt);
        }

        //Random order
        let alternatives = [];
        let answers = [];
        for (let i = 0; i < alternativesOrdered.length; i++) {

            let randomAlt = alternativesOrdered[Math.trunc(Math.random() * alternativesOrdered.length)];

            while (alternatives.includes(randomAlt)) {
                randomAlt = alternativesOrdered[Math.trunc(Math.random() * alternativesOrdered.length)];
            }

            alternatives[i] = randomAlt;
            answers[i] = alternativesOrdered.indexOf(randomAlt).toString();
        }

        //Create options as array of objects
        let options = [];

        for (let i = 0; i < warmupAlternatives.length; i++) {
            options[i] = {
                label: warmupAlternatives[i],
                value: warmupAlternatives[i] == question.correct_answer ? `x${question._id}` : `${i}${question._id}`
            };
        }

        //Create embed with the question
        let embed = new MessageEmbed()
            .setTitle(question.question)
            .setColor('#39A2A5')
            .setDescription('Elige la respuesta correcta.')
            .setFooter(`Warmup id: \`${question._id}\``)

        if (question.image) {
            embed.setImage(question.image)
        }

        //Create row with select menu
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('warmupSelect')
                    .setPlaceholder('Selecciona una alternativa')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(options),
            );

        //Reply
        await interaction.reply({ embeds: [embed], ephemeral: true, components: [row] });

    }

};