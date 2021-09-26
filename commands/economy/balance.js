const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance'),
    async execute(interaction, profileData) {
        const embed = new MessageEmbed()
            .setTitle(`${interaction.user.username}'s balance`)
            .setDescription(`💸 Your current balance is **Ɖ${profileData.dons}**.`);
        interaction.reply({ embeds: [embed] });
    }    
}