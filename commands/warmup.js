const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warmup')
        .setDescription('Quick question to warm that neurons up'),
    async execute(interaction) {
        await interaction.reply('Is Holanda a country? yes/no');
    },
};