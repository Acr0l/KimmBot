const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

// usage: /poll <Timer>(Optional) <Question> <Option 1> <Option 2> ...
module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Creates a poll."),
        
        async execute(client, interaction, profileData) {
            
        }
};