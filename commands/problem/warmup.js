// Required variables:
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const QuizModel = require('../../models/quizSchema');


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
        const subject = interaction.options.getString('subject');
        let alternativesOrdered = []; //First must be the correct one

        //Question fetching

        //Random element is stored in "question"
        const questionsArray = await QuizModel.aggregate([{$sample: {size: 1}}]);
        const question = questionsArray[0];  

        alternativesOrdered[0] = question.correct_answer;
        for (const alt of question.incorrect_answers)
        {
            alternativesOrdered.push(alt);
        }

        //Random order
        let alternatives = [];
        let answers = [];
        for (let i = 0; i < alternativesOrdered.length; i++) {
            
            let randomAlt = alternativesOrdered[Math.trunc(Math.random() * alternativesOrdered.length)];
            
            while(alternatives.includes(randomAlt)){
                randomAlt = alternativesOrdered[Math.trunc(Math.random() * alternativesOrdered.length)];
            }
            
            alternatives[i] = randomAlt;
            answers[i] = alternativesOrdered.indexOf(randomAlt).toString();
        }

        //Create options as array of objects
        let options = [];
        for (let i = 0; i < alternatives.length; i++ ){
            options[i] = {
                label: alternatives[i],
                value: answers[i] + "x" + question._id,
            };
        }

        //Create embed with the question
        let embed;
        
        if(question.image != undefined){
            embed = new MessageEmbed()
            .setColor('#39A2A5')
            .setAuthor('Warm up...')
            .setImage(question.image)
            .setTitle(question.question)
            .setFooter('Cuidado con tu energía mental');
        }
        else {
            embed = new MessageEmbed()
            .setColor('#39A2A5')
            .setAuthor('Warm up...')
            .setTitle(question.question)
            .setFooter('Cuidado con tu energía mental');
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