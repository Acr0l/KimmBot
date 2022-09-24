const { translate } = require("../../handlers/language"),
  mustache = require("mustache");
const { forHumans } = require("../../util/time");

module.exports = {
  async use(interaction, profileData, item, amount) {
    const currentME = profileData.mentalEnergy.me;
    const maxME = profileData.mentalEnergy.totalMe;
    const itemEffects = {
      Water: {
        me: 0,
        mr: 1,
        // 30 minutes
        duration: 1800,
      },
      Gatorade: {
        me: 10,
        mr: 0,
      },
    };
    const { guild } = interaction;
    const effect = itemEffects[item.name];

    // Check if effect is temporary or permanent
    if (effect.duration) {
      // Check if effect is already active
      if (profileData.effects.find((e) => e.name === item.name)) {
        return await interaction.reply(
          translate(guild, "DRINK_ALREADY_ACTIVE")
        );
      } else {
        // Add effect to profile
        profileData.effects.push({
          name: item.name,
          duration: effect.duration,
          meBoost: effect.me,
          mrBoost: effect.mr,
        });
        profileData.effects.find((e) => e.name === item.name).durationLeft =
          effect.duration;
      }
      interaction.reply(
        mustache.render(translate(guild, "DRINK_ACTIVATED"), {
          item: item.name,
          duration: forHumans(effect.duration / 1000, guild),
        })
      );
    } else {
      // Add effect to profile
      if (currentME + effect.me * amount > maxME) {
        profileData.mentalEnergy.me = maxME;
        interaction.reply(translate(guild, "DRINK_ME_ALL"));
      } else {
        profileData.mentalEnergy.me += effect.me * amount;
        interaction.reply(
          mustache.render(translate(guild, "DRINK_ME_AMOUNT"), {
            amount: effect.me * amount,
          })
        );
      }
      profileData.mentalEnergy.mr += effect.mr * amount;
    }
    // TODO: Work with timers for MR.
    // profileData.mentalEnergy.mr += effect.mr;
    await profileData.save();
  },
};
