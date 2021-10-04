const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    cooldown: 3600,
    data: new SlashCommandBuilder()
        .setName('workout')
        .setDescription('Test to train your brain'),
    async execute(interaction) {
        await interaction.reply({ content: `This command is not yet implemented.`, ephemeral: true });
    },
};