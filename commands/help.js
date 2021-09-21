const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display basic commands and short description.'),
    async execute(interaction) {
        await interaction.reply('WIP');
    },
};