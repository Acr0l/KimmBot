const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Reminder for commands'),
    async execute(interaction) {
        await interaction.reply('Hay más qlos en el server, preguntale a alguno no me wei \n Saludos cordiales');
    },  
};