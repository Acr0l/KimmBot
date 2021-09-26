const { SlashCommandBuilder } = require('@discordjs/builders');
const profileModel = require('../../models/profileSchema');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('See your info'),
    async execute(interaction, profileData) {
        
        //let inventory = profileData.inventory.length != 0 ? profileData.items.join(',') : 'The inventory is empty.';
        let cooldowns = profileData.cooldowns.length != 0 ? profileData.cooldowns.join(',') : 'No cooldowns.';
        let stats = profileData.stats.length != 0 ? profileData.stats.join(',') : 'No stats.';

        const embed = new MessageEmbed()
            .setColor('#34577A')
            .setTitle(`${interaction.user.username}'s profile`)
            .setThumbnail("https://cdn.discordapp.com/avatars/" + profileData.userID + "/" + interaction.user.avatar + ".jpeg")
            .addFields(
                { name: 'Level', value: profileData.level.toString(), inline: true },
                { name: 'Experience', value: profileData.xp.toString(), inline: true },
                { name: 'Tier', value: profileData.tier.toString(), inline: true },
                { name: 'Money', value: `Ɖ${profileData.dons}`, inline: true },
                //{ name: 'Inventory', value: inventory, inline: true },
                { name: 'Cooldowns', value: cooldowns, inline: true },
                { name: 'Title', value: profileData.title[0], inline: true },
                { name: 'Stats', value: stats, inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};