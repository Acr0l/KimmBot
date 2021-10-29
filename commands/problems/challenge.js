const { SlashCommandBuilder } = require('@discordjs/builders'),
    { readyToAdvance } = require('../../util/tierFunctions'),
    { translate } = require('../../handlers/language'),
    { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js'),
    mustache = require('mustache');

module.exports = {
    cooldown: 10,//86400 * 3,
    data: new SlashCommandBuilder()
        .setName('challenge')
        .setDescription('The ultimate test'),
    async execute(interaction, profileData) {
        const { guild } = interaction,
            keyItem = profileData.inventory.find(
                (item) => item.id.toString() == '6175f765562d1f316070f096',
            );
        if (!readyToAdvance(profileData) || !keyItem) {
            return interaction.reply(translate(guild, 'PROBLEM_REQ_NOT_MET'));
        }
        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId('confirm')
                .setLabel(translate(guild, 'YES'))
                .setStyle('DANGER')
                .setEmoji('👊'),
        );
        await interaction.reply({
            content: mustache.render(translate(guild, 'CONFIRM')),
            components: [row],
            ephemeral: true,
        });

        const filter = (i) => i.customId == 'confirm';
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'BUTTON',
            time: 40000,
        });

        collector.on('collect', (i) => {
            interaction.editReply({content:'In progress...', components: []});
            i.reply({ephemeral: true, content: 'Fight me!'});
        });

        // collector.on('end', () => {
        //     interaction.editReply({
        //         embeds: [embed],
        //         components: components(true),
        //     });
        // });
    },
};
