const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder().setName(`use`).setDescription(`Use item.`),
    /**
     * @param { Message } interaction
     * @param { Object } profileData
     * @param { Client } client
     */
    async execute(interaction, profileData, client) {
        await interaction.reply({
            content: `This command is not yet implemented.`,
            ephemeral: true,
        });
    },
};
