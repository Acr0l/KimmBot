const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const QuizModel = require('../models/quizSchema');

module.exports = {
    name: "warmupSelect",
    description: "Selects a warmup",
    run: async (client, interaction, args) => {

            
        const value = interaction.values[0];
        const username = interaction.member.nickname;

        // Values start as [alternativeIndex]x[questionId], if alternativeIndex = 0 means it's the riight answer
        
        const inputIdQuestion = value.substr(2, value.length - 1); 
        let embed;

        if (value.startsWith("0x")) {
            embed = new MessageEmbed()
                .setColor('#80EA98')
                .setTitle("Respuesta correcta " + username + " 😎👍")
                .setThumbnail('https://freepikpsd.com/media/2019/10/correcto-incorrecto-png-7-Transparent-Images.png')
                //.setFooter('');
            
        }
        else {
            const questionsArray = await QuizModel.find({ _id: inputIdQuestion}); //Find the element with the id
            const question = questionsArray[0];  

            if(question.image != undefined){
                embed = new MessageEmbed()
                .setColor('#eb3434')
                .setTitle("Respuesta incorrecta " + username + " 😔👊")
                .addField("Pregunta: ", question.question)
                .setImage(question.image)
                .addField("Respuesta correcta: ", question.correct_answer)
                .setThumbnail('https://cdn.pixabay.com/photo/2012/04/12/20/12/x-30465_960_720.png')
            }
            else {
                embed = new MessageEmbed()
                .setColor('#eb3434')
                .setTitle("Respuesta incorrecta " + username + " 😔👊")
                .addField("Pregunta: ", question.question)
                .addField("Respuesta correcta: ", question.correct_answer)
                .setThumbnail('https://cdn.pixabay.com/photo/2012/04/12/20/12/x-30465_960_720.png')
            }   

            // await interaction.followUp({ embeds: [embed], components: [], ephemeral: false });
        }
        await interaction.reply({ embeds: [embed], components: [], ephemeral: false });
    },
};