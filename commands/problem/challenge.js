const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('challenge')
        .setDescription('The ultimate test'),
    async execute(interaction, profileData) {
        await interaction.reply({ content: `This command is not yet implemented.`, ephemeral: true });
    },
};