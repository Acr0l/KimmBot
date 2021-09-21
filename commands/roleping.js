const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendmsg')
        .setDescription('Send input given.')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message to send to the guild.')
        ),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        await interaction.reply(`${message}`);
    },
};