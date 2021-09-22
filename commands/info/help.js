const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { readdirSync } = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Short description about the available commands.'),
    async execute(interaction, profileData) {

        const directories = source => readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const embed = new MessageEmbed()
            .setColor('#57CC98')
            .setAuthor('Kimm Bot Team','https://i.imgur.com/dSavUpW.png')            
            .setThumbnail('https://i.imgur.com/dSavUpW.png')
            .setTitle("Kimm Bot")
            .setDescription('Kimm Bot is a Discord bot that provides a game-like experience for players to study and compete with each other.\n \n The game is played using the Application Interactions provided by Discord, where the players will have levels and experience points, many subjects to study, and a leaderboard to rank the players according to their performance in the game.\n \n They will also have a Tier system to unlock new features and unlock new questions that will provide them more experience points and other benefits. Currerncy used is **Dons (Ɖ)**.')
            .addFields(
                {name: "Statistics commands" , value: "`/profile` `/stats` `/inv`"},
                {name: "Money and Items commands" , value: "`/shop` `/buy`"},
                {name: "Educational commands" , value: "`/subjects` `/warmup` `/workout` `/challenge` `/kimmtest` `/suggest`"},
            );
                    
        await interaction.reply({embeds: [embed] });
    },
};