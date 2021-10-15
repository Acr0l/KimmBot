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
        const effect = itemEffects[item.name];
        if (currentME + effect.me * amount > maxME) {
            profileData.mentalEnergy.me = maxME;
        } else {
            profileData.mentalEnergy.me += effect.me * amount;
        }
        // TODO: Work with timers for MR.
        // profileData.mentalEnergy.mr += effect.mr;
        profileData.save();
    },
};
