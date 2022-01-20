const { SlashCommandBuilder } = require('@discordjs/builders'),
    { MessageEmbed } = require('discord.js'),
    { levelFormula } = require('../../util/levelFunctions'),
    { translate } = require('../../handlers/language'),
    { getItem } = require('../../handlers/itemInventory'),
    mustache = require('mustache');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('See your info'),
    async execute(interaction, profileData) {
        const { guild } = interaction;
        let lvlPercentage = (
                (profileData.xp / levelFormula(profileData.level)) *
                100
            ).toFixed(2),
            effectMr = profileData.effects
                .map((effect) => effect.mrBoost)
                .reduce((a, b) => a + b, 0),
            effectMe = profileData.effects
                .map((effect) => effect.meBoost)
                .reduce((a, b) => a + b, 0),
            fieldTitles = translate(guild, 'PROFILE_FIELDS').split(','),
            stats = `**ME**: ${profileData.mentalEnergy.me}/${
                profileData.mentalEnergy.totalMe
            }${effectMe !== 0 ? ` (+${effectMe})` : ''}\n**MR**: ${
                profileData.mentalEnergy.mr
            }${effectMr !== 0 ? ` (+${effectMr})` : ''}`;
        let equipped =
            profileData.equipment != 0
                ? profileData.equipment
                      .map((e) => `-  **${getItem(e).name}**`)
                      .join('\n')
                : translate(guild, 'PROFILE_NO_EQUIPMENT');

        const embed = new MessageEmbed()
            .setColor('#34577A')
            .setAuthor({
                name: mustache.render(translate(guild, 'PROFILE_AUTHOR'), {
                    user: interaction.user.username,
                }),
                userURL:
                    'https://cdn.discordapp.com/avatars/' +
                    profileData.userID +
                    '/' +
                    interaction.user.avatar +
                    '.jpeg',
            })
            .setTitle(profileData.title[0])
            .setThumbnail(
                'https://cdn.discordapp.com/avatars/' +
                    profileData.userID +
                    '/' +
                    interaction.user.avatar +
                    '.jpeg',
            )
            .addFields(
                {
                    name: fieldTitles[0],
                    value: mustache.render(
                        translate(guild, 'PROFILE_PROGRESS'),
                        {
                            level: profileData.level,
                            percentage: lvlPercentage,
                            experience: profileData.xp,
                            tier: profileData.tier,
                        },
                    ),
                    inline: false,
                },
                { name: fieldTitles[1], value: stats, inline: false },
                { name: fieldTitles[2], value: equipped, inline: true },
                {
                    name: fieldTitles[3],
                    value: `Ɖ${profileData.dons}`,
                    inline: true,
                },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
