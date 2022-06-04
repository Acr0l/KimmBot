// const logger = require('../../logger');

const { SlashCommandBuilder } = require('@discordjs/builders'),
	{
		MessageEmbed,
		MessageActionRow,
		MessageSelectMenu,
	} = require('discord.js'),
	{ getItemList } = require('../../handlers/itemInventory'),
	{ translate, iTranslate } = require('../../handlers/language');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Display available items.'),
	/**
     * @param { Message } interaction
     * @param { Object } profileData
     * @param { Client } client
     */
	async execute(interaction) {
		// #region Variables
		const { guild } = interaction;
		const langTypes = iTranslate(guild, 'shop.item_types', { returnObjects: true });
		const items = getItemList(),
			sortedKeys = Object.keys(items).sort((a, b) => items[a].price - items[b].price),
			{ title, description } = iTranslate(guild, 'shop.embed', { returnObjects: true }),
			embed = new MessageEmbed().setTitle(title).setColor('#0099ff').setDescription(description);
		// #endregion
		const categories = Object.keys(langTypes).map((type, i) => {
			return {
				source: type,
				type: langTypes[type],
				items: sortedKeys.filter((key) => items[key].type === i).map(key => {
					return {
						name: `${items[key].name} (Ɖ${items[key].price})`,
						description: iTranslate(guild, `items.descriptions.${items[key].description.toLowerCase()}`),
					};
				}),
			};
		});
		const componentOptions = categories.map((category) => {
			return {
				label: category.type,
				value: Object.keys(langTypes).find(key => langTypes[key] === category.type),
				description: iTranslate(guild, `shop.category_description.${category.source}`),
			};
		});
		const components = (state) => [
			new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId('shop')
					.setPlaceholder(translate(guild, 'HELP_PLACEHOLDER'))
					.setDisabled(state)
					.addOptions(componentOptions),
			),
		];
		await interaction.reply({
			embeds: [embed],
			components: components(false),
		});

		const filter = (i) => {
			return i.user.id === interaction.user.id && i.customId === 'shop';
		};
		const collector = interaction.channel.createMessageComponentCollector({
			filter,
			componentType: 'SELECT_MENU',
			time: 120000,
		});

		collector.on('collect', async (collectorInteraction) => {
			/**
			 * @type { String }
			 * @description The value of componentOptions ('equipment', 'consumable', 'special consumable', 'quest')
			 */
			const [selectedCategory] = collectorInteraction.values;
			const cat2 = categories.find(cat => cat.source === selectedCategory.toLowerCase());
			const embed2 = new MessageEmbed()
				.setTitle('Shop title')
				.setColor('#0099ff')
				.setDescription('Cool description')
				.setFields(cat2.items.map((item) => {
					return {
						name: item.name,
						value: item.description,
					};
				}));
			try {
				await collectorInteraction.update({ embeds: [embed2] });
			}
			catch (error) {
				await collectorInteraction.update({ content: iTranslate(guild, 'error') });
				console.error(error);
			}
		});

		collector.on('end', () => {
			interaction.editReply({
				embeds: [embed],
				components: components(true),
			});
		});
	},
};
