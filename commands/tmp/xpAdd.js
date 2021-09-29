const { SlashCommandBuilder } = require('@discordjs/builders');
const applyXp = require('../../util/userfuncs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`xpadd`)
        .setDescription(`Add xp directly to the user`)
        .addNumberOption(amount =>
            amount
                .setName(`amount`)
                .setRequired(true)
                .setDescription(`The amount of xp to add`)
        ),
  /**
    * @param { Message } interaction
    * @param { Object } profileData
    * @param { Client } client
    */
    async execute(interaction, profileData, client) {
        const amount = interaction.options.getNumber(`amount`);
        await interaction.reply(`Fetching information`);
        await applyXp(profileData, amount, interaction)
            .then(() => interaction.deleteReply());
    }
}
