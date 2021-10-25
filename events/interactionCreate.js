const client = require('../index'),
    profileDatabase = require('../models/profileSchema'),
    { translate } = require('../handlers/language'),
    mustache = require('mustache'),
    RECOVERYTIME = 5;

client.on('interactionCreate', async (interaction) => {
    // Get guild.
    const { guild } = interaction;
    // Get user from db.
    let profileData;
    try {
        profileData = await profileDatabase.findOne({
            userID: interaction.user.id,
        });
        if (!profileData && interaction.commandName !== 'register') {
            await interaction.reply({
                content: translate(guild, 'CREATE_PROFILE'),
                ephemeral: false,
            });
            return;
        }
    } catch (err) {
        console.log(err);
    }

    // Select Menu Handling
    if (interaction.isSelectMenu()) {
        const menu = client.selectmenu.get(interaction.customId);
        if (menu) menu.run(client, interaction, profileData);
        else console.log('Menu not found.');
    }

    // Command Handling

    if (!interaction.isCommand()) return;

    if (interaction.commandName !== 'register' && profileData) {
        const currentTime = Date.now();

        // Mental Energy Handling
        if (
            profileData.mentalEnergy.lastRecovery <
            currentTime - RECOVERYTIME * 1000 * 60
        ) {
            let recoveryAmount = Math.floor(
                (currentTime -
                    profileData.mentalEnergy.lastRecovery.getTime()) /
                    (RECOVERYTIME * 1000 * 60),
            );
            profileData.mentalEnergy.me = Math.min(
                profileData.mentalEnergy.me +
                    profileData.currentMR * recoveryAmount,
                profileData.currentME,
            );
            profileData.mentalEnergy.lastRecovery = Date.now();
            await profileData.save();
        }

        // Effect Handling
        if (profileData.effects.length > 0) {
            for (let i = 0; i < profileData.effects.length; i++) {
                if (profileData.effects[i].durationLeft <= 0) {
                    profileData.effects.splice(i, 1);
                    i--;
                }
            }
        }

        // Cooldown Handling
        if (client.commands.get(interaction.commandName).cooldown) {
            let justRegistered = false;
            if (
                !profileData.cooldowns.has(interaction.commandName) &&
                client.commands.get(interaction.commandName).cooldown !== 0
            ) {
                justRegistered = true;
                profileData.cooldowns.set(interaction.commandName, Date.now());
            }

            // Cooldown Check

            const timeStamp = profileData.cooldowns
                .get(interaction.commandName)
                .getTime();
            const cmdCooldown =
                client.commands.get(interaction.commandName).cooldown * 1000;
            if (currentTime < timeStamp + cmdCooldown && !justRegistered) {
                await interaction.reply(
                    mustache.render(translate(guild, 'COOLDOWN'), {
                        time: secondsToDhms(
                            (cmdCooldown - (currentTime - timeStamp)) / 1000,
                        ),
                    }),
                );
                return;
            }

            profileData.cooldowns.set(interaction.commandName, currentTime);
            await profileData.save();
        }
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
    let h = Math.floor((seconds % (3600 * 24)) / 3600);
    let m = Math.floor((seconds % 3600) / 60);
    let s = Math.floor(seconds % 60);

    let dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : '';
    let hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
    let mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
    let sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
    return dDisplay + hDisplay + mDisplay + sDisplay;
}
