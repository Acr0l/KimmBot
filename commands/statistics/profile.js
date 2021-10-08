const { SlashCommandBuilder } = require('@discordjs/builders');
const profileModel = require('../../models/profileSchema');
const { MessageEmbed } = require('discord.js');
const { levelFormula } = require('../../util/userfuncs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('See your info'),
    async execute(interaction, profileData) {
        
        //let inventory = profileData.inventory.length != 0 ? profileData.items.join(',') : 'The inventory is empty.';
        // let levelPercent = Math.floor((profileData.level / profileData.maxLevel) * 100);
        let lvlPercentage = ((profileData.xp / levelFormula(profileData.level)) * 100).toFixed(2);
        let progress = `**Level**: ${profileData.level} (${lvlPercentage}%)\n**XP**: ${profileData.xp}\n**Tier**: ${profileData.tier}`
        let stats = `**ME**: ${profileData.mentalEnergy.me}/${profileData.mentalEnergy.totalMe}\n**MR**: ${profileData.mentalEnergy.mr}`;
        let equipped = profileData.equipment != 0 ? profileData.equipment.map(e => `-  **${e}**`).join('\n') : 'No items equipped.';

        const embed = new MessageEmbed()
            .setColor('#34577A')
            .setAuthor(`${interaction.user.username}'s profile`, "https://cdn.discordapp.com/avatars/" + profileData.userID + "/" + interaction.user.avatar + ".jpeg")
            .setTitle(profileData.title[0])
            .setThumbnail("https://cdn.discordapp.com/avatars/" + profileData.userID + "/" + interaction.user.avatar + ".jpeg")
            .addFields(
                { name: 'Progress', value: progress, inline: false },
                { name: 'Stats', value: stats, inline: false },
                { name: 'Equipment', value: equipped, inline: true },
                { name: 'Money', value: `Ɖ${profileData.dons}`, inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};