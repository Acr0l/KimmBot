const { SlashCommandBuilder } = require('@discordjs/builders'),
	{ MessageEmbed } = require('discord.js'),
	{ subjects } = require('../../util/subjects.json');
// { translate } = require('../../handlers/language');

const subjectsArr = [];

for (const subject of Object.keys(subjects)) {
	subjectsArr.push({ name: subject, value: subject });
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('suggest')
		.setDescription(
			'Suggest questions to the bot, you may get a title after getting many questions approved.',
		)
		.addStringOption((option) =>
			option
				.setName('subject')
				.setDescription('The subject of the suggestion.')
				.setRequired(true)
				.addChoices(...subjectsArr),
		)
		.addStringOption((option) =>
			option
				.setName('suggestion')
				.setDescription(
					'Write here the question you would like to suggest.',
				)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('correctans')
				.setDescription(
					'Write here the correct answer to your question.',
				)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('incorrectans')
				.setDescription(
					'Write here the incorrect answers, separated by a coma (,).',
				)
				.setRequired(true),
		),

	async execute(interaction, profileData, client) {
		// if (await DBLIST.findOne(interaction.user.id)) return interaction.reply('You are not allowed to use this command.')
		// Build embed (TODO)
		const suggestionSubject = interaction.options.getString('subject');
		const suggestion = interaction.options.getString('suggestion');
		const correctAnswer = interaction.options.getString('correctans');
		const incorrectAnswers = interaction.options
			.getString('incorrectans')
			.split(',');

		const embed = new MessageEmbed()
			.setTitle(`Suggestion from ${interaction.user.username}`)
			.setDescription(`Subject: ${suggestionSubject}`)
			.addField('Suggestion', suggestion)
			.addField('Correct answer', correctAnswer)
			.addField('Incorrect answers', incorrectAnswers.join(', '))
			.setFooter({ text: `User ID: ${interaction.user.id}` })
			.setTimestamp()
			.setColor('#0099ff');

		client.channels.cache
			.get('894728345235914802')
			.send({ embeds: [embed] });
		interaction.reply(
			// TODO: translate
			'Your suggestion has been sent to the bot, thanks for your support!',
		);
	},
};
