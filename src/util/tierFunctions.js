const { EmbedBuilder } = require('discord.js');
const tierRequirements = {
		0: {},
		1: {
			0: 3,
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
		1: {
			correct: 40,
			accuracy: 60,
		},
		2: {
			correct: 95,
			accuracy: 65,
		},
		3: {
			correct: 150,
			accuracy: 70,
		},
		4: {
			correct: 230,
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

const readyToAdvance = (user) => {
	const tierMap = {};
	user.stats.map((stat) => {
		if (tierMap[stat.tier]) {
			tierMap[stat.tier] += 1;
		} else {
			tierMap[stat.tier] = 1;
		}
	});
	for (const key in tierRequirements[user.tier + 1]) {
		if (tierMap[key] < tierRequirements[user.tier + 1][key] || !tierMap[key]) {
			return false;
		}
	}
	return true;
};

const readyToAdvanceStat = (user, statName) => {
	const stat = user.stats.find((s) => {
		return s.subject == statName;
	});
	if (stat.tier === 7) {
		return false;
	}
	const tier = statTierRequirements[stat.tier + 1];
	if (stat.correct >= tier.correct && stat.accuracy >= tier.accuracy && user.tier + 1 > stat.tier) {
		return true;
	}
	return false;
};

const advanceStatTier = (user, statName) => {
	const stat = user.stats.find((s) => {
		return s.subject.toLowerCase() == statName.toLowerCase();
	});
	stat.tier += 1;
	return readyToAdvance(user);
};

const advanceTier = (user) => {
	user.tier += 1;
};

const updateStat = (user, statName, correct) => {
	const stat = user.stats.find((s) => {
		return s.subject.toLowerCase() == statName.toLowerCase();
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

const printStatus = (interaction, status, objectStatus = {}) => {
	const [ embedTitle, embedDescription ] = mustache.render(translate(interaction.guild, status), objectStatus).split(':');
	const embed = new EmbedBuilder()
		.setColor(objectStatus.color || '#34577A')
		.setTitle(embedTitle)
		.setDescription(embedDescription);
	interaction.followUp({ embeds: [embed] });
};

const applyStatChanges = async (user, stat, interaction) => {
	if (updateStat(user, stat.name, stat.correct)) {
		if (advanceStatTier(user, stat.name)) {printStatus(interaction, 'TIER_READY', { tier: user.tier + 1, user: interaction.user.username, color: '#F0F0F0' });}
		const subjectTier = user.stats.find(
			(uStat) => uStat.subject == stat.name,
		).tier;
		printStatus(interaction, 'STAT_ADVANCE', {
			subject: stat.name,
			tier: subjectTier,
			color: '#39A2A5',
		});
	}
	return user;
};

const applyTierChanges = async (user, interaction) => {
	if (readyToAdvance(user)) {
		advanceTier(user);
		printStatus(interaction, 'TIER_ADVANCE', { tier: user.tier, color: 'F0F0F0' });
	}
	await user.save();
};

module.exports = { applyStatChanges, readyToAdvance, applyTierChanges };
