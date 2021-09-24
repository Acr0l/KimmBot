// Required variables:
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

// Answer examples:
const historyQuestions = ["¿Qué es Holanda?", "¿Cuál es la capital de los Países Bajos?", "¿Qué le pasa a lupita?"];
const historyAnswers = ["Una región histórica", "Ámsterdam", "No sé"];
const historyIncorrect1 = ["Un país", "Holanda", "Algo terrible"];
const historyIncorrect2 = ["Un continente", "Bélgica", "No quiere bailar"];
const historyIncorrect3 = ["Una lengua", "Aruba", "Está castigada"];
const historyIncorrect4 = ["Una ciudad", "Sint Maarten", "Le pusieron los cuernos"];

let includesImage = false;
let imgUrl = "";


module.exports = {
    data: new SlashCommandBuilder()
        .setName('warmup')
        .setDescription('Quick question to warm those neurons up.')
        .addStringOption(option =>
            option.setName('subject')
                .setDescription('Subject to warm up')
                .setRequired(true)
                .addChoice('Math', 'Math')
                .addChoice('History and Geography', 'History and Geography')
        ),

    async execute(interaction, profileData) {

        const subject = interaction.options.getInteger('subject');

        //Question generation
        let currQuestion = "";
        let alternativesOrdered = []; //First must be the correct one

        if (subject == 'Math') {           

            if ( Math.trunc( Math.random() * 2 ) == 0 ){ // 50% chance knlowledge problem
                const http = require("https");
                const maxNumber = 10;

                const mathAnswer = Math.trunc( Math.random() * (maxNumber + 1) );
                const mathQuestion = "";

                const options = {
                    "method": "GET",
                    "hostname": "numbersapi.p.rapidapi.com",
                    "port": null,
                    "path": "/" + mathAnswer + "/math?json=true&fragment=true",
                    "headers": {
                        "x-rapidapi-host": "numbersapi.p.rapidapi.com",
                        "x-rapidapi-key": "3b2a49c004mshe2e4548b924c406p1fcc35jsn148bc0c6d1fb",
                        "useQueryString": true
                    }
                };

                const req = http.request(options, function (res) {
                    const chunks = [];

                    res.on("data", function (chunk) {
                        chunks.push(chunk);
                    });

                    res.on("end", function () {
                        const body = Buffer.concat(chunks);
                        const problem = JSON.parse(body.toString());

                        if(problem.found){
                            mathQuestion = "What's " + problem.text + "?";					
                        }

                        else{
                            console.log('Math problem not found');
                            mathQuestion = "An error ocurred";
                        }

                    });
                });
                req.end();

                currQuestion = mathQuestion;
                alternativesOrdered[0] = mathAnswer.toString(); // First element is the right answer
                
                for (let i = 1 ; i <= 4 ; i++){ // 4 more elements are wrong answers, they don't repeat

                    let number = mathAnswer.toString();

                    while (alternativesOrdered.includes(number)){
                        number = Math.trunc(Math.random() * (maxNumber + 1)).toString();
                    }

                    alternativesOrdered[i] = number;
                }
            }
            
            else { // 50% change calculation problem
                let numbers = [];
                for (let i = 0 ; i < 4 ; i++){
                    numbers[i] = Math.trunc(Math.random() * 21 );
                }

                alternativesOrdered[0] =  numbers[0] + (numbers[1] * numbers[2]) - numbers[3]; // Correct answer
                alternativesOrdered[1] =  (numbers[0] + numbers[1] * numbers[2]) - numbers[3];
                alternativesOrdered[2] =  ((numbers[0] + numbers[1]) * numbers[2]) - numbers[3];
                alternativesOrdered[3] =  numbers[0] + numbers[1] * (numbers[2] - numbers[3]);
                alternativesOrdered[4] =  numbers[0] * numbers[1] * numbers[2] - numbers[3];

                currQuestion = "¿Cuál es el resultado del siguiente ejercicio?"
                includesImage = true;
                imgUrl = 'https://chart.apis.google.com/chart?cht=tx&chl=' + numbers[0] + '%2B' + numbers[1] + '%5Ctimes' + numbers[2] + '-' + numbers[3] + '&chf=bg%2Cs%2C30343480&chco=F0F0F0';
            }      
        }

        else if (subject == 'History and Geography') {
            const indexQuestion = Math.trunc(Math.random() * historyQuestions.length);
            currQuestion = historyQuestions[indexQuestion];
            alternativesOrdered = [historyAnswers[indexQuestion], historyIncorrect1[indexQuestion], historyIncorrect2[indexQuestion], historyIncorrect3[indexQuestion], historyIncorrect4[indexQuestion]];
        }

        else {
            currQuestion = "No hay preguntas para esta materia";
            alternativesOrdered[0] = "Respuesta correcta";
        }

        //Random order
        let alternatives = [];
        let answers = [];
        for (let i = 0; i < alternativesOrdered.length; i++) {
            let filled = true;
            let index;
            while (filled) {
                index = Math.trunc(Math.random() * alternativesOrdered.length);
                if (alternatives[index] == "") filled = false;
            }
            alternatives[index] = alternativesOrdered[i];
            answers[index] = i.toString();
        }

        //Create options as array of objects
        let options = [];
        for (let i = 0; i < alternatives.length; i++ ){
            options[i] = {
                label: alternatives[i],
                value: answers[i],
            };
        }

        //Create embed with the question
        let embed;
        if(includesImage){
            embed = new MessageEmbed()
            .setColor('#39A2A5')
            .setAuthor('Warm up...')
            .setImage(imgUrl)
            .setTitle(currQuestion)
            .setFooter('Cuidado con tu energía mental');
        }
        else {
            embed = new MessageEmbed()
            .setColor('#39A2A5')
            .setAuthor('Warm up...')
            .setTitle(currQuestion)
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


        await interaction.reply({ embeds: [embed], ephemeral: true, components: [row] });

    }

};