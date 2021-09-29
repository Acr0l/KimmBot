const { SlashCommandBuilder } = require('@discordjs/builders');
const profileModel = require('../../models/profileSchema');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('See your info'),
    async execute(interaction, profileData) {
        
        //let inventory = profileData.inventory.length != 0 ? profileData.items.join(',') : 'The inventory is empty.';
        // let levelPercent = Math.floor((profileData.level / profileData.maxLevel) * 100);
        let progress = `**Level**: ${profileData.level}(INSERT STATS)\n**XP**: ${profileData.xp}\n**Tier**:${profileData.tier}`
        let stats = `**ME**: ${profileData.mentalEnergy.totalMe}\n**MR**: ${profileData.mentalEnergy.mr}`;

        const embed = new MessageEmbed()
            .setColor('#34577A')
            .setAuthor(`${interaction.user.username}'s profile`, "https://cdn.discordapp.com/avatars/" + profileData.userID + "/" + interaction.user.avatar + ".jpeg")
            .setTitle(profileData.title[0])
            .setThumbnail("https://cdn.discordapp.com/avatars/" + profileData.userID + "/" + interaction.user.avatar + ".jpeg")
            .addFields(
                { name: 'Progress', value: progress, inline: false },
                { name: 'Money', value: `Ɖ${profileData.dons}`, inline: true },
                { name: 'Stats', value: stats, inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};