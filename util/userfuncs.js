const readline = require('readline');

const meFormula = (level) => {
    return Math.floor(Math.log(level) / Math.log(2) + 2);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const levelFormula = (level) => {
    return Math.floor((Math.pow(level, 2) * 53) - (level * 53) + 150);
}

const readyToLevelUp = (user, level) => {
    return user.xp >= levelFormula(level + 1);
}

function addXp(user, exp) {
    user.xp += exp;
    user.totalXp += exp;
    return (readyToLevelUp(user, user.level));
}

const createLevelUp = (user) => {
    user.level += 1;
    user.xp -= levelFormula(user.level);
    user.mentalEnergy.totalMe += meFormula(user.level);
    user.mentalEnergy.me = user.mentalEnergy.totalMe;
}

const printLvlUp = (user, interaction) => {
    interaction.followUp({ content: `${interaction.user.username} has leveled up to level ${user.level}!\n**New ME**: ${user.mentalEnergy.totalMe}\n**New MR**: ${user.mentalEnergy.mr}` });
}

/**
 * 
 * @param { Object } user - The user object (profileData)
 * @param { Number } exp - The amount of xp to add
 */
const applyXp = async (user, exp, interaction) => {
    if (addXp(user, exp)) {
        createLevelUp(user);
        printLvlUp(user, interaction);
    } 
    user.save();
}

rl.question("", function (level) {
    console.log(levelFormula(parseInt(level)));
    rl.close();
});

rl.on('close', function () {
    process.exit(0);
});

module.exports = { applyXp, levelFormula };