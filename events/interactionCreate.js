// const client = require('../index'),
const profileDatabase = require('../models/profileSchema'),
    { translate } = require('../handlers/language'),
    mustache = require('mustache'),
    RECOVERYTIME = 5,
    logger = require('../logger');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
        if (!interaction.inGuild()) return;
        // Get guild.
        const { guild } = interaction;
        // Get user from db.
        let profileData;
        try {
            profileData = await getUser({
                interaction,
                profileDatabase,
                guild,
            });
        } catch (err) {
            logger.error(err);
        }

        // Command Handling

        if (!interaction.isCommand()) return;

        if (interaction.commandName !== 'register' && profileData) {
            profileData = await updateUserStatus({
                profileData,
                interaction,
                guild,
            });
        }

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) return await profileData.save();

        try {
            await command.execute(interaction, profileData, interaction.client);
        } catch (error) {
            logger.error(error);
        }
        // });
    },
};

function forHumans(seconds, trGuild) {
    let levels = [
        [
            Math.floor(((seconds % 31536000) % 86400) / 3600),
            translate(trGuild, 'hours'),
        ],
        [
            Math.floor((((seconds % 31536000) % 86400) % 3600) / 60),
            translate(trGuild, 'minutes'),
        ],
        [
            (((seconds % 31536000) % 86400) % 3600) % 60,
            translate(trGuild, 'seconds'),
        ],
    ];
    let returntext = '';

    for (let i = 0, max = levels.length; i < max; i++) {
        if (levels[i][0] === 0) continue;
        returntext +=
            ' ' +
            levels[i][0] +
            ' ' +
            (levels[i][0] === 1
                ? levels[i][1].substr(0, levels[i][1].length - 1)
                : levels[i][1]);
    }
    return returntext.trim();
}

async function getUser({ interaction, profileDatabase, guild }) {
    const user = await profileDatabase.findOne({
        userID: interaction.user.id,
    });
    if (!user && interaction.commandName !== 'register') {
        await interaction.reply({
            content: translate(guild, 'CREATE_PROFILE'),
            ephemeral: false,
        });
        return true;
    }
    return user;
}

async function updateUserStatus({ profileData, interaction, guild}) {
    const currentTime = Date.now();
    // Mental Energy Handling)
    if (
        profileData.mentalEnergy.lastRecovery <
        currentTime - RECOVERYTIME * 1000 * 60
    ) {
        let recoveryAmount = Math.floor(
            (currentTime - profileData.mentalEnergy.lastRecovery.getTime()) /
                (RECOVERYTIME * 1000 * 60),
        );
        profileData.mentalEnergy.me = Math.min(
            profileData.mentalEnergy.me +
                profileData.currentMR * recoveryAmount,
            profileData.currentME,
        );
        profileData.mentalEnergy.lastRecovery = Date.now();
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
    if (interaction.client.commands.get(interaction.commandName).cooldown > 0) {
        let justRegistered = false;
        if (
            !profileData.cooldowns.has(interaction.commandName) &&
            interaction.client.commands.get(interaction.commandName).cooldown !== 0
        ) {
            justRegistered = true;
            profileData.cooldowns.set(interaction.commandName, Date.now());
        }

        // Cooldown Check

        const timeStamp = profileData.cooldowns
            .get(interaction.commandName)
            .getTime();
        const cmdCooldown =
            interaction.client.commands.get(interaction.commandName).cooldown * 1000;
        if (currentTime < timeStamp + cmdCooldown && !justRegistered) {
            await interaction.reply(
                mustache.render(translate(guild, 'COOLDOWN'), {
                    time: forHumans(
                        (cmdCooldown - (currentTime - timeStamp)) / 1000,
                        interaction.guild,
                    ),
                }),
            );
            return profileData;
        }

        profileData.cooldowns.set(interaction.commandName, currentTime);
        return profileData;
    }
}
