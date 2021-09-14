const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Generate a random quote.'),
    async execute(interaction) {

        const getData = [];

        // Contact the API
        fetch("https://quotes.rest/quote/random?language=en&limit=1")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            getData.push(...data);
        });
        

        await interaction.reply(getData[0].contents.quote);
    },
};