const { translate } = require('../../handlers/language'),
	{ getActivity } = require('../../handlers/activity'),
	{ MessageEmbed } = require('discord.js'),
	quizDatabase = require('../../models/quizSchema');

module.exports = {
	async use(interaction, profileData, currentItem, amount) {
		const { guild } = interaction;
		if (amount != 1) {return interaction.reply(translate(guild, 'INVALID_AMOUNT'));}
		const id = getActivity(interaction.user.id);
		if (!id) {
			interaction.reply(translate(guild, 'HINT_AFK'));
			return;
		}

		try {
			const quiz = await quizDatabase.findOne({ _id: id });
			if (!quiz) {
				interaction.reply({
					content: translate(guild, 'HINT_NO_QUIZ'),
					ephemeral: true,
				});
				return;
			}
			// Not implemented.
			// if (quiz.hints.length == 0) {
			//     interaction.reply(translate(guild, "HINT_NO_HINTS"));
			//     return;
			// }
			const fewAlternatives = [
				quiz.correct_answer,
				...quiz.incorrect_answers,
			]
				.slice(0, 3)
				.sort(() => Math.random() - 0.5);
			const embed = new MessageEmbed()
				.setColor(0x00ff00)
				.setTitle(translate(guild, 'HINT_SUCCESSFUL_REPLY'))
				.setDescription(fewAlternatives.join('\n'));
			interaction.reply({
				ephemeral: true,
				embeds: [embed],
			});
		}
		catch (e) {
			interaction.reply({
				content: translate(guild, 'HINT_NO_QUIZ'),
				ephemeral: true,
			});
			console.log(e);
		}
	},
};
