const tierRequirements = {
        0: {},
        1: {
            1: 1,
        },
        2: {
            2: 2,
        },
        3: {
            3: 2,
        },
        4: {
            4: 3,
        },
        5: {
            5: 3,
            6: 1,
        },
        6: {
            6: 3,
            7: 1,
        },
        7: {
            7: 5,
        },
    },
    statTierRequirements = {
        0: {
            correct: 10,
            accuracy: 40,
        },
        1: {
            correct: 40,
            accuracy: 60,
        },
        2: {
            correct: 80,
            accuracy: 65,
        },
        3: {
            correct: 130,
            accuracy: 70,
        },
        4: {
            correct: 200,
            accuracy: 75,
        },
        5: {
            correct: 280,
            accuracy: 80,
        },
        6: {
            correct: 370,
            accuracy: 85,
        },
        7: {
            correct: 500,
            accuracy: 93,
        },
    },
    { translate } = require('../handlers/language'),
    mustache = require('mustache');

/**
 * Function to check if the user can advance to the next tier.
 * @param { Object } user - The user object (profileData)
 * @returns boolean - Whether or not the user is ready to advance.
 */
const readyToAdvance = (user) => {
    let tierMap = {};
    user.stats.map((stat) => {
        if (tierMap[stat.tier]) {
            tierMap[stat.tier] += 1;
        } else {
            tierMap[stat.tier] = 1;
        }
    });
    for (key in tierRequirements[user.level + 1]) {
        if (tierMap[key] < tierRequirements[user.tier + 1][key]) {
            return false;
        }
    }
    return true;
};

/**
 * Function to check if the user's stat can advance to the next tier.
 * @param { Object } user - The user object (profileData)
 * @param { String } statName - The name of the stat to check.
 * @returns boolean - Whether or not the stat can advance.
 */
const readyToAdvanceStat = (user, statName) => {
    let stat = user.stats.find((stat) => {
        return stat.subject == statName;
    });
    if (stat.tier === 7) {
        return false;
    }
    let tier = statTierRequirements[stat.tier];
    if (stat.correct >= tier.correct && stat.accuracy >= tier.accuracy) {
        return true;
    }
    return false;
};

/**
 * Function to advance the user's stat and check if they can advance to the next tier.
 * @param { Object } user - The user object (profileData)
 * @param { String } statName - The name of the stat to check.
 * @returns Boolean - Whether or not the stat is ready to advance.
 */
const advanceStatTier = (user, statName) => {
    let stat = user.stats.find((stat) => {
        return stat.subject.toLowerCase() == statName.toLowerCase();
    });
    stat.tier += 1;
    return readyToAdvance(user);
};

const advanceTier = (user) => {
    user.tier += 1;
};

/**
 * Function to apply changes to the user's stats.
 * @param { Object } user - The user object (profileData)
 * @param { String } statName - The name of the stat to check.
 * @param { Boolean } correct - Whether or not the user answered correctly.
 * @returns Boolean - Whether or not the stat is ready to advance.
 */
const updateStat = (user, statName, correct) => {
    let stat = user.stats.find((stat) => {
        return stat.subject.toLowerCase() == statName.toLowerCase();
    });
    if (!stat) {
        user.stats.push({
            subject: statName,
            tier: 0,
            correct: correct ? 1 : 0,
            incorrect: correct ? 0 : 1,
        });
    } else {
        stat.correct += correct ? 1 : 0;
        stat.incorrect += correct ? 0 : 1;
    }
    return readyToAdvanceStat(user, statName);
};

/**
 * Function used to print whether the user advanced tier/stat.
 * @param { Object } interaction - The interaction object.
 * @param { String } status - Capitalized string with the status after changes were applied.
 * @param { Object } objectStatus - Object with optional text to replace in the template.
 */
const printStatus = (interaction, status, objectStatus = {}) => {
    interaction.followUp(
        mustache.render(translate(interaction.guild, status), objectStatus),
    );
};

/**
 * Called every time the Workout command is used.
 * @param { Object } user - The user object (profileData)
 * @param { Object } stat - The stat to update.
 * @param { String } stat.name - The name of the subject to update.
 * @param { Boolean } stat.correct - Whether or not the user answered correctly.
 * @param { Object } interaction - The interaction object.
 */
const applyStatChanges = async (user, stat, interaction) => {
    if (updateStat(user, stat.name, stat.correct)) {
        advanceStatTier(user, stat.name);
        const subjectTier = user.stats.find(
            (stat) => stat.subject == subject,
        ).tier;
        printStatus(interaction, 'STAT_ADVANCE', { subject: stat.name, tier: subjectTier });
    }
    await user.save();
};

const applyTierChanges = async (user, interaction) => {
    if (readyToAdvance(user)) {
        advanceTier(user);
        printStatus(interaction, 'TIER_ADVANCE', { tier: user.tier });
    }
    await user.save();
};

module.exports = { applyStatChanges, readyToAdvance, applyTierChanges };
