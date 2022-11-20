const { REGISTER } = require("../constants/command");
const { forHumans } = require("../util/time");

/** @module interactionCreate */
const Profile = require("../models/profileSchema"),
  { translate, iTranslate } = require("../handlers/language"),
  mustache = require("mustache"),
  RECOVERYTIME = 5,
  logger = require("../logger");

module.exports = {
  name: "interactionCreate",
  once: false,
  /**
   * Event handler, called when a user interacts with the bot.
   * @param {import('discord.js').Interaction} interaction
   * @see {@link https://discord.js.org/#/docs/main/stable/class/Interaction}
   * @returns {Promise<void>}
   */
  async execute(interaction) {
    if (!interaction.inGuild()) return;
    if (!interaction.isCommand()) return;

    // Get guild.
    const { guild } = interaction;
    // #region Get user from db.
    let profileData;
    try {
      profileData = await getUser({
        interaction,
        guild,
      });
    } catch (err) {
      logger.error(err);
      interaction.reply({ content: iTranslate(guild, "error") });
      return;
    }
    // #endregion

    // Command Handling

    if (interaction.commandName !== REGISTER && profileData) {
      profileData = await updateUserStatus({
        profileData,
        interaction,
        guild,
      });
    }

    // @ts-ignore
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return await profileData.save();

    try {
      await command.execute(interaction, profileData, interaction.client);
    } catch (error) {
      logger.error(error);
      interaction.reply({ content: iTranslate(guild, "error") });
      return;
    }
  },
};


/**
 * Fetch user from database and, if not found, prompt user to register.
 * @param {{interaction: *, guild: *}} params
 * @returns {Promise<Profile|boolean>} user profile or false if user is not found
 */
async function getUser({ interaction, guild }) {
  const user = await Profile.findOne({
    userID: interaction.user.id,
  });
  if (!user && interaction.commandName !== REGISTER) {
    await interaction.reply({
      content: iTranslate(guild, "CREATE_PROFILE"),
      ephemeral: false,
    });
    return false;
  }
  // @ts-ignore
  return user;
}

async function updateUserStatus({ profileData, interaction, guild }) {
  const currentTime = Date.now();
  // Mental Energy Handling
  if (
    profileData.mentalEnergy.lastRecovery <
    currentTime - RECOVERYTIME * 1000 * 60
  ) {
    const recoveryAmount = Math.floor(
      (currentTime - profileData.mentalEnergy.lastRecovery.getTime()) /
        (RECOVERYTIME * 1000 * 60)
    );
    profileData.mentalEnergy.me = Math.min(
      profileData.mentalEnergy.me + profileData.currentMR * recoveryAmount,
      profileData.currentME
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
        mustache.render(translate(guild, "COOLDOWN"), {
          time: forHumans(
            (cmdCooldown - (currentTime - timeStamp)) / 1000,
            interaction.guild
          ),
        })
      );
      return profileData;
    }

    profileData.cooldowns.set(interaction.commandName, currentTime);
    return profileData;
  }
}
