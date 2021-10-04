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
        const menu = client.selectmenu.get(interaction.customId);
        if (menu) menu.run(client, interaction, profileData)
        else console.log('Menu not found.');
    }
    
    // Command Handling
    
    if (!interaction.isCommand()) return;
    
    // Cooldown Handling
    let justRegistered = false;
    if (!profileData.cooldowns.has(interaction.commandName)) {
        justRegistered = true;
        profileData.cooldowns.set(interaction.commandName, Date.now());
    }

    // Cooldown Check
    const currentTime = Date.now();
    const timeStamp = profileData.cooldowns.get(interaction.commandName).getTime();
    const cmdCooldown = client.commands.get(interaction.commandName).cooldown * 1000;
    if (currentTime < timeStamp + cmdCooldown && !justRegistered) {
        await interaction.reply('You are on cooldown for this command. Please wait ' + Math.round((cmdCooldown - (currentTime - timeStamp)) / 1000) + ' seconds.');
        return;
    }

    profileData.cooldowns.set(interaction.commandName, currentTime);
    profileData.save();
    
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, profileData, client);
    } catch (error) {
        console.error(error);
    }

});