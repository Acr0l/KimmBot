const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton, MessageSelectMenu  } = require('discord.js'); 
const { SlashCommandBuilder } = require('@discordjs/builders');


const languageQuestions = ["¿Cuál es la tercera letra de 'Chocapic'?"];
const languageAnswers =   ["o"]
const languajeIncorrect1 = ["p"];
const languajeIncorrect2 = ["a"];
const languajeIncorrect3 = ["i"];
const languajeIncorrect4 = ["c"];

const historyQuestions = ["¿Qué es Holanda?","¿Cuál es la capital de los Países Bajos?","¿Qué le pasa a lupita?"];
const historyAnswers   = ["Una región histórica","Ámsterdam","No sé"];
const historyIncorrect1 = ["Un país", "Holanda", "Algo terrible"];
const historyIncorrect2 = ["Un continente","Bélgica", "No quiere bailar"];
const historyIncorrect3 = ["Una lengua","Aruba","Está castigada"];
const historyIncorrect4 = ["Una ciudad","Sint Maarten","Le pusieron los cuernos"];


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
                .addChoice('Musical Theory (highly recommended)', 7)
                ),

    async execute(interaction) {

        
        if (interaction.isSelectMenu())
        {
            if (interaction.customId === 'select') {
             await interaction.reply("¡Gracias por tu respuesta!");
            }
        }
        else        
        {    
            const subject = interaction.options.getInteger('subject');        
            
            let currQuestion = "Aquí va una pregunta";
            let alternativesOrdered = ['Correcto','Casi correcto','Incorrecto','Pal pico','Todas las anteriores'];

            if      (subject == 1){currQuestion = "Aquí va una pregunta de matemática"}

            else if (subject == 2){
                const indexQuestion = Math.trunc(Math.random() * (languageQuestions.length + 1));
                currQuestion = languageQuestions[indexQuestion];
                alternativesOrdered = [languageAnswers[indexQuestion],languajeIncorrect1[indexQuestion],languajeIncorrect2[indexQuestion],languajeIncorrect3[indexQuestion],languajeIncorrect4[indexQuestion]]
            }

            else if (subject == 3){
                const indexQuestion = Math.trunc(Math.random() * (historyQuestions.length + 1));
                currQuestion = historyQuestions[indexQuestion];
                alternativesOrdered = [historyAnswers[indexQuestion],historyIncorrect1[indexQuestion],historyIncorrect2[indexQuestion],historyIncorrect3[indexQuestion],historyIncorrect4[indexQuestion]];            
            }

            else {
                currQuestion = "Pta justo estoy trabajando en este ramo, prueba otro crack :D";
            }

            
            let alternatives = ["A","B","C","D","E"];
            /*for (let i = 0; i < 5 ; i++)
            {
                const currAlternative = alternativesOrdered[Math.trunc(Math.random() * 6)];
                let exists = false;
                for  (let x = 0; x < alternatives.length; x++)
                {
                    if(currAlternative == alternatives[x]) exists=true;
                }
                if (!exists) alternatives[i] = currAlternative;
            }*/

            alternatives = alternativesOrdered;


            const embed = new MessageEmbed()
            .setColor('#57CC98')
            .setAuthor('Warm up...')
            //.setAuthor('Kimm Bot', 'https://i.imgur.com/AfFp7pu.png', 'https://discord.js.org')
            .setTitle(currQuestion)
            .setFooter('No funciona la correción asiq tranqi');


            const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('select')
                    .setPlaceholder('Select an option')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions([
                        {
                            label: alternatives[0],
                            value: "A",
                        },
                        {
                            label: alternatives[1],
                            value: "B",
                        },
                        {
                            label: alternatives[2],
                            value: "C",
                        },
                        {
                            label: alternatives[3],
                            value: "D",
                        },
                        {
                            label: alternatives[4],
                            value: "E",
                        },                    
                    ]),
            );

            
            await interaction.reply({ embeds: [embed], ephemeral : true , components: [row] }); 
        }       
    }

};