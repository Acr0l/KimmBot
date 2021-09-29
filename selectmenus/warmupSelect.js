const { Client, CommandInteraction, MessageEmbed , MessageActionRow , MessageSelectMenu} = require("discord.js");
const quizModel = require('../models/quizSchema');
const profileModel = require('../models/profileSchema');
const applyXp = require('../util/userfuncs');

module.exports = {
    name: "warmupSelect",
    description: "Selects a warmup",
    run: async (client, interaction, args) => {

        const profileData = await profileModel.findOne({ userID: interaction.user.id });   
        const value = interaction.values[0];
        const answerIsCorrect = value.startsWith("0x");
        const username = interaction.member.nickname;

        // Values start as [alternativeIndex]x[questionId], if alternativeIndex = 0 means it's the riight answer
        
        const inputIdQuestion = value.substr(2, value.length - 1); 
        const questionsArray = await quizModel.find({ _id: inputIdQuestion}); //Find the element with the id
        const question = questionsArray[0]; 
        
        let embed;
        let ephemeralEmbed;  
        
        //console.log(interaction);

        if (answerIsCorrect) {
            embed = new MessageEmbed()
            .setColor('#80EA98')
            .setTitle("Respuesta correcta " + username + " 😎👍")
            .setDescription(`¡${username} ha conseguido ${question.difficulty} puntos de experiencia!`)
            .setThumbnail('https://freepikpsd.com/media/2019/10/correcto-incorrecto-png-7-Transparent-Images.png');            
            
            await applyXp(profileData, question.difficulty, interaction);
        }
        else {
            
            //Public embed
            embed = new MessageEmbed()
            .setColor('#eb3434')
            .setTitle("Respuesta incorrecta " + username + " 😔👊")
            .setThumbnail('https://cdn.pixabay.com/photo/2012/04/12/20/12/x-30465_960_720.png');

            //Ephemeral embed            
            if(question.image != undefined){
                ephemeralEmbed = new MessageEmbed()
                .setColor('#eb3434')
                .setTitle("Respuesta incorrecta " + username + " 😔👊")
                .addField("Pregunta: ", question.question)
                .setImage(question.image)
                .addField("Respuesta correcta: ", question.correct_answer)
                .setThumbnail('https://cdn.pixabay.com/photo/2012/04/12/20/12/x-30465_960_720.png');
            }
            else {
                ephemeralEmbed = new MessageEmbed()
                .setColor('#eb3434')
                .setTitle("Respuesta incorrecta " + username + " 😔👊")
                .addField("Pregunta: ", question.question)
                .addField("Respuesta correcta: ", question.correct_answer)
                .setThumbnail('https://cdn.pixabay.com/photo/2012/04/12/20/12/x-30465_960_720.png');
            }   

            // await interaction.followUp({ embeds: [embed], components: [], ephemeral: false });
        }
        
        if(!answerIsCorrect) {
            await interaction.update({ embeds: [ephemeralEmbed], components: [], ephemeral: true });
        }
        else {
            const row = new MessageActionRow()
            .addComponents(
              new MessageSelectMenu()
                .setCustomId('warmupSelect')
                .setPlaceholder(question.correct_answer)
                .setMinValues(0)
                .setMaxValues(1)
                .addOptions([{label:"nothing" , value: "nothing"}])
                .setDisabled(true)
            );

            await interaction.update({ components: [row] });
        } 

        await interaction.followUp({ embeds: [embed], components: [], ephemeral: false });
    },
};