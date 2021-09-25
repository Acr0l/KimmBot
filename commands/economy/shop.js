const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`shop`)
    .setDescription(`Display available items.`),
  /**
    * @param { Message } interaction
    * @param { Object } profileData
    * @param { Client } client
    */
  async execute(interaction, profileData, client) {
    await interaction.reply(`WIP.`);

  }
}
