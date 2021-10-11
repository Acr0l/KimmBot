const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`setlang`)
        .setDescription(`Set the server's language.`)
        .setDefaultPermission(false),
  /**
    * @param { Object } interaction - Object with the interaction data sent by the user.
    * @param { Object } profileData - Object from the database with the user profile data.
    * @param { Object } client - The discord.js client object.
    */
    async execute(interaction, profileData, client) {
        
    }
}
