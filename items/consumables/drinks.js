const { translate } = require('../../handlers/language'),
	mustache = require('mustache'),
	moment = require('moment');

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
					translate(guild, 'DRINK_ALREADY_ACTIVE'),
				);
			}
			else {
				// Add effect to profile
				profileData.effects.push({
					name: item.name,
					duration: effect.duration,
					meBoost: effect.me,
					mrBoost: effect.mr,
				});
				profileData.effects.find(
					(e) => e.name === item.name,
				).durationLeft = effect.duration;
			}
			interaction.reply(
				mustache.render(translate(guild, 'DRINK_ACTIVATED'), {
					item: item.name,
					duration: forHumans(effect.duration / 1000),
				}),
			);
		}
		else {
			// Add effect to profile
			if (currentME + effect.me * amount > maxME) {
				profileData.mentalEnergy.me = maxME;
				interaction.reply(translate(guild, 'DRINK_ME_ALL'));
			}
			else {
				profileData.mentalEnergy.me += effect.me * amount;
				interaction.reply(
					mustache.render(translate(guild, 'DRINK_ME_AMOUNT'), {
						amount: effect.me * amount,
					}),
				);
			}
			profileData.mentalEnergy.mr += effect.mr * amount;
		}
		// TODO: Work with timers for MR.
		// profileData.mentalEnergy.mr += effect.mr;
		await profileData.save();
	},
};

// function secondsToDhms(seconds) {
// 	seconds = Number(seconds);
// 	const d = Math.floor(seconds / (3600 * 24));
// 	const h = Math.floor((seconds % (3600 * 24)) / 3600);
// 	const m = Math.floor((seconds % 3600) / 60);
// 	const s = Math.floor(seconds % 60);

// 	const dDisplay = d > 0 ? d + (d == 1 ? ' day, ' : ' days, ') : '';
// 	const hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
// 	const mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
// 	const sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : '';
// 	return dDisplay + hDisplay + mDisplay + sDisplay;
// }

function forHumans(seconds) {
	const levels = [
		[Math.floor(seconds / 31536000), 'years'],
		[Math.floor((seconds % 31536000) / 86400), 'days'],
		[Math.floor(((seconds % 31536000) % 86400) / 3600), 'hours'],
		[Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), 'minutes'],
		[(((seconds % 31536000) % 86400) % 3600) % 60, 'seconds'],
	];
	let returntext = '';

	for (let i = 0, max = levels.length; i < max; i++) {
		if (levels[i][0] === 0) continue;
		// @ts-ignore
		returntext += ' ' + levels[i][0] + ' ' + (levels[i][0] === 1 ? levels[i][1].substr(0, levels[i][1].length - 1) : levels[i][1]);
	}
	return returntext.trim();
}
