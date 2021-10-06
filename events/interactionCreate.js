const client = require('../index');
const profileModel = require('../models/profileSchema');
const RECOVERYTIME = 5;

client.on('interactionCreate', async interaction => {
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

    if (interaction.commandName !== 'register' && profileData) {
        const currentTime = Date.now();

        // Mental Energy Handling
        
        if (profileData.mentalEnergy.lastRecovery < currentTime - RECOVERYTIME * 1000 * 60) {
            console.log('Recovering mental energy.');
            let recoveryAmount = Math.floor((currentTime - profileData.mentalEnergy.lastRecovery) / (RECOVERYTIME * 1000 * 60));
            profileData.mentalEnergy.me = Math.min(profileData.mentalEnergy.me + profileData.mentalEnergy.mr * recoveryAmount, profileData.mentalEnergy.totalMe);
            profileData.mentalEnergy.lastRecovery += recoveryAmount * RECOVERYTIME * 1000 * 60;
            await profileData.save();
        }

        // Cooldown Handling
        let justRegistered = false;
        if (!profileData.cooldowns.has(interaction.commandName)) {
            justRegistered = true;
            profileData.cooldowns.set(interaction.commandName, Date.now());
        }

        // Cooldown Check
        
        const timeStamp = profileData.cooldowns.get(interaction.commandName).getTime();
        const cmdCooldown = client.commands.get(interaction.commandName).cooldown * 1000;
        if (currentTime < timeStamp + cmdCooldown && !justRegistered) {
            await interaction.reply(`You are on cooldown for this command. Please wait ${secondsToDhms((cmdCooldown - (currentTime - timeStamp)) / 1000)}.`);
            return;
        }

        profileData.cooldowns.set(interaction.commandName, currentTime);
        profileData.save();
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, profileData, client);
    } catch (error) {
        console.error(error);
    }

});
function secondsToDhms(seconds) {
    seconds = Number(seconds);
    let d = Math.floor(seconds / (3600 * 24));
    let h = Math.floor(seconds % (3600 * 24) / 3600);
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 60);

    let dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}