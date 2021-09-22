const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');


const languageQuestions = ["¿Cuál es la tercera letra de 'Chocapic'?", "¿Cuántos idiomas existen?"];
const languageAnswers = ["o", "6.909"]
const languajeIncorrect1 = ["p", "1.503"];
const languajeIncorrect2 = ["a", "642"];
const languajeIncorrect3 = ["i", "9.012"];
const languajeIncorrect4 = ["c", "320"];

const historyQuestions = ["¿Qué es Holanda?", "¿Cuál es la capital de los Países Bajos?", "¿Qué le pasa a lupita?"];
const historyAnswers = ["Una región histórica", "Ámsterdam", "No sé"];
const historyIncorrect1 = ["Un país", "Holanda", "Algo terrible"];
const historyIncorrect2 = ["Un continente", "Bélgica", "No quiere bailar"];
const historyIncorrect3 = ["Una lengua", "Aruba", "Está castigada"];
const historyIncorrect4 = ["Una ciudad", "Sint Maarten", "Le pusieron los cuernos"];


module.exports = {
    data: new SlashCommandBuilder()
        .setName('warmup')
        .setDescription('Quick question to warm those neurons up.')
        .addIntegerOption(option =>
            option.setName('subject')
                .setDescription('Subject to warm up')
                .setRequired(true)
                .addChoice('Math', 1)
                .addChoice('Language', 2)
                .addChoice('History and Geography', 3)
            //.addChoice('Sciences', 4)
            //.addChoice('Computer Sciences', 5)
            //.addChoice('Life Skills', 6)
            //.addChoice('Musical Theory (highly recommended)', 7)
        ),

    async execute(interaction, profileData) {


        const subject = interaction.options.getInteger('subject');

        let currQuestion = "Aquí va una pregunta";
        let alternativesOrdered = ['Correcto', 'Casi correcto', 'Incorrecto', 'Pal pico', 'Todas las anteriores'];

        if (subject == 1) {
            const numbers = [];
            for (let i = 0; i < 5; i++) {
                numbers[i] = Math.trunc(Math.random() * 21);
            }

            currQuestion = "¿Cuánto es " + numbers[0] + " + " + numbers[1] + " - " + numbers[2] + " x " + numbers[3] + "?";
            alternativesOrdered[0] = (numbers[0] + numbers[1] - (numbers[2] * numbers[3])).toString();
            alternativesOrdered[1] = ((numbers[0] + numbers[1] - numbers[2]) * numbers[3]).toString();
            alternativesOrdered[2] = (numbers[0] + numbers[1] + numbers[2] * numbers[3]).toString();
            alternativesOrdered[3] = (numbers[0] + numbers[2] - numbers[1] * numbers[3]).toString();
            alternativesOrdered[4] = (numbers[0] - numbers[1] - numbers[2] * numbers[3]).toString();

        }

        else if (subject == 2) {
            const indexQuestion = Math.trunc(Math.random() * languageQuestions.length);
            currQuestion = languageQuestions[indexQuestion];
            alternativesOrdered = [languageAnswers[indexQuestion], languajeIncorrect1[indexQuestion], languajeIncorrect2[indexQuestion], languajeIncorrect3[indexQuestion], languajeIncorrect4[indexQuestion]]
        }

        else if (subject == 3) {
            const indexQuestion = Math.trunc(Math.random() * historyQuestions.length);
            currQuestion = historyQuestions[indexQuestion];
            alternativesOrdered = [historyAnswers[indexQuestion], historyIncorrect1[indexQuestion], historyIncorrect2[indexQuestion], historyIncorrect3[indexQuestion], historyIncorrect4[indexQuestion]];
        }

        else {
            currQuestion = "Pta justo estoy trabajando en este ramo, prueba otro crack :D";
        }

        //Random order
        let alternatives = ["", "", "", "", ""];
        let answers = ['', '', '', '', ''];
        const abecedary = ['A', 'B', 'C', 'D', 'E'];
        for (let i = 0; i < 5; i++) {
            let filled = true;
            let index;
            while (filled) {
                index = Math.trunc(Math.random() * 5);
                if (alternatives[index] == "") filled = false;
            }
            alternatives[index] = alternativesOrdered[i];
            answers[index] = abecedary[i];
        }

        const embed = new MessageEmbed()
            .setColor('#39A2A5')
            .setAuthor('Warm up...')
            //.setAuthor('Kimm Bot', 'https://i.imgur.com/AfFp7pu.png', 'https://discord.js.org')
            .setTitle(currQuestion)
            .setFooter('Cuidado con tu energía mental');


        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('warmupSelect')
                    .setPlaceholder('Selecciona una alternativa')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions([
                        {
                            label: alternatives[0],
                            value: answers[0],
                        },
                        {
                            label: alternatives[1],
                            value: answers[1],
                        },
                        {
                            label: alternatives[2],
                            value: answers[2],
                        },
                        {
                            label: alternatives[3],
                            value: answers[3],
                        },
                        {
                            label: alternatives[4],
                            value: answers[4],
                        },
                    ]),
            );


        await interaction.reply({ embeds: [embed], ephemeral: true, components: [row] });

    }

};