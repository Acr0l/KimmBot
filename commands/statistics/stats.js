const { SlashCommandBuilder } = require('@discordjs/builders'),
    { MessageEmbed } = require('discord.js'),
    { translate } = require('../../handlers/language'),
    mustache = require('mustache');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`stats`)
        .setDescription(`Shows the user specific stats in different subjects.`),
  /**
    * @param { Object } interaction - Object with the interaction data sent by the user.
    * @param { Object } profileData - Object from the database with the user profile data.
    * @param { Object } client - The discord.js client object.
    */
    async execute(interaction, profileData, client) {
        const { guild } = interaction;

        let embed = new MessageEmbed()
            .setColor(`#0099ff`)
            .setTitle(`${translate(guild, "STATS_TITLE")}`)
            .setDescription(`${translate(guild, `STATS_DESCRIPTION`)}`)
            .setFields(
                profileData.stats.sort((a, b) => a.tier - b.tier).map(stat => {
                    return {
                        name: stat.subject,
                        value: mustache.render(
                            translate(guild, `STATS_FIELD_DATA`),
                            {
                                tier: stat.tier,
                                accuracy: stat.accuracy,
                                totalAnswered: stat.totalAns
                            }
                        )
                    }
                })
            );
        interaction.reply({ embeds: [embed] });
    }
}
