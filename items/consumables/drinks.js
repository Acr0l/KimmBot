const { translate } = require("../../handlers/language");
const mustache = require("mustache");

module.exports = {
    async use(interaction, profileData, item, amount) {
        const currentME = profileData.mentalEnergy.me;
        const maxME = profileData.mentalEnergy.totalMe;
        const itemEffects = {
            Water: {
                me: 0,
                mr: {
                    effect: 1,
                    duration: 1800,
                },
            },
            Gatorade: {
                me: 10,
                mr: 0,
            },
        };
        const { guild } = interaction;
        const effect = itemEffects[item.name];
        if (currentME + effect.me * amount > maxME) {
            profileData.mentalEnergy.me = maxME;
            interaction.followUp(translate(guild, "DRINK_ME_ALL"));
        } else {
            profileData.mentalEnergy.me += effect.me * amount;
            interaction.followUp(
                mustache.render(translate(guild, "DRINK_ME_AMOUNT"), {
                    amount: effect.me * amount,
                })
            );
        }
        // TODO: Work with timers for MR.
        // profileData.mentalEnergy.mr += effect.mr;
        await profileData.save();
    },
};
