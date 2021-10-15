const { SlashCommandBuilder } = require("@discordjs/builders");
const profileModel = require("../../models/profileSchema");
const { MessageEmbed } = require("discord.js");
const { levelFormula } = require("../../util/userfuncs");
const { translate } = require("../../handlers/language");
const mustache = require("mustache");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("See your info"),
    async execute(interaction, profileData) {
        const { guild } = interaction;
        let lvlPercentage = (
            (profileData.xp / levelFormula(profileData.level)) *
            100
        ).toFixed(2);
        let fieldTitles = translate(guild, "PROFILE_FIELDS").split(",");
        let stats = `**ME**: ${profileData.mentalEnergy.me}/${profileData.mentalEnergy.totalMe}\n**MR**: ${profileData.mentalEnergy.mr}`;
        let equipped =
            profileData.equipment != 0
                ? profileData.equipment.map((e) => `-  **${e}**`).join("\n")
                : translate(guild, "PROFILE_NO_EQUIPMENT");

        const embed = new MessageEmbed()
            .setColor("#34577A")
            .setAuthor(
                mustache.render(translate(guild, "PROFILE_AUTHOR"), {
                    user: interaction.user.username,
                }),
                "https://cdn.discordapp.com/avatars/" +
                    profileData.userID +
                    "/" +
                    interaction.user.avatar +
                    ".jpeg"
            )
            .setTitle(profileData.title[0])
            .setThumbnail(
                "https://cdn.discordapp.com/avatars/" +
                    profileData.userID +
                    "/" +
                    interaction.user.avatar +
                    ".jpeg"
            )
            .addFields(
                {
                    name: fieldTitles[0],
                    value: mustache.render(
                        translate(guild, "PROFILE_PROGRESS"),
                        {
                            level: profileData.level,
                            percentage: lvlPercentage,
                            experience: profileData.xp,
                            tier: profileData.tier,
                        }
                    ),
                    inline: false,
                },
                { name: fieldTitles[1], value: stats, inline: false },
                { name: fieldTitles[2], value: equipped, inline: true },
                {
                    name: fieldTitles[3],
                    value: `Ɖ${profileData.dons}`,
                    inline: true,
                }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
