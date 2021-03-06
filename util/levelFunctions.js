const meFormula = (level) => {
    return Math.floor(Math.log(level) / Math.log(2) + 2);
};

const levelFormula = (level) => {
    return Math.floor(Math.pow(level, 2) * 53 - level * 53 + 150);
};

const readyToLevelUp = (user, level) => {
    return user.xp >= levelFormula(level + 1);
};

function addXp(user, exp) {
    user.xp += exp;
    user.totalXp += exp;
    return user;
}

const createLevelUp = async (user) => {
    user.level += 1;
    user.xp -= levelFormula(user.level);
    user.mentalEnergy.totalMe += meFormula(user.level);
    user.mentalEnergy.me = user.mentalEnergy.totalMe;
    return user;
};

const printLvlUp = (user, interaction) => {
    interaction.followUp({
        content: `${interaction.user.username} has leveled up to level ${user.level}!\n**New ME**: ${user.mentalEnergy.totalMe}\n**New MR**: ${user.mentalEnergy.mr}`,
    });
};

/**
 *
 * @param { Object } user - The user object (profileData)
 * @param { Number } exp - The amount of xp to add
 * @return { profileData } - The updated user object
 */
const applyXp = async (user, exp, interaction) => {
    user = addXp(user, exp);
    if (readyToLevelUp(user, user.level)) {
        user = await createLevelUp(user);
        printLvlUp(user, interaction);
        return applyXp(user, 0, interaction);
    }
    return user;
};

/**
 *
 * @param { Object } itemList - The list of items in the database.
 * @param { String } itemName - The name of the item to search for.
 * @returns - The item object that matches the name.
 */
const checkItemInfo = (itemList, itemName) => {
    for (const key in itemList) {
        if (itemList[key].name === itemName) {
            return itemList[key];
        }
    }
    return null;
};

module.exports = { applyXp, levelFormula, checkItemInfo };
