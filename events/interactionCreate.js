const client = require('../index');
const profileModel = require('../models/profileSchema');

client.on('interactionCreate', async interaction  => {
    // Get user from db.
    let profileData;
    try {
        profileData = await profileModel.findOne({ userID: interaction.user.id });
        if (!profileData && interaction.commandName !== 'register') {
            await interaction.reply({ content: 'You have not set up your profile yet. Please do so by typing `/register`.', ephemeral: false });
            return;
        }
    }
    catch (err) {
        console.log(err);
    }

    // Select Menu Handling
    if (interaction.isSelectMenu()) {
        // await interaction.deferReply({ ephemeral: false });
        const menu = client.selectmenu.get(interaction.customId);
        if (menu) menu.run(client, interaction, profileData);
        // console.log(command);
    }

    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, profileData);
    } catch (error) {
        console.error(error);
        // await interaction.reply({ content: 'Ups! Hubo un problema con ese comando...', ephemeral: true });
    }

});