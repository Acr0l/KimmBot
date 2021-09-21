const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('workout')
        .setDescription('Test to train your brain'),
    async execute(interaction) {
        await interaction.reply('WIP');
    },
};