const { SlashCommandBuilder } = require('@discordjs/builders'),
	{
		MessageEmbed,
		MessageActionRow,
		MessageSelectMenu,
	} = require('discord.js'),
	{ getItemList } = require('../../handlers/itemInventory'),
	{ iTranslate } = require('../../handlers/language'),
	{ EMBED_COLORS } = require('../../constants/constants');
// TODO: Dynamically generate select menu options (Remove chosen category from list)
module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Display available items.'),
	/**
		 * Display shop and current available items.
		 * @param {import('discord.js').Interaction} userInteraction
		 * @see {@link https://discord.js.org/#/docs/main/stable/class/Interaction}
		 */
	async execute(userInteraction) {
		// #region Variables
		/**
		 * @typedef {import('discord.js').Guild} Guild
		 */
		/**
		 * @type {Guild}
		 * @see {@link https://discord.js.org/#/docs/main/stable/class/Guild}
		 */
		const guild = userInteraction.guild;
		const langTypes = iTranslate(guild, 'shop.item_types', { returnObjects: true });
		const items = getItemList(),
			sortedKeys = Object.keys(items).sort((a, b) => items[a].price - items[b].price),
			// TODO: Add image to shop embed
			/**
			 * @typedef {Object} ShopEmbed
			 * @property {String} title
			 * @property {String} description
			 */
			/** @type {ShopEmbed} */
			{ title, description } = iTranslate(guild, 'shop.embed.start_embed', { returnObjects: true }),
			embed = new MessageEmbed().setTitle(title).setColor('#0099ff').setDescription(description);
		// #endregion
		const categories = Object.keys(langTypes).map((type, i) => {
			return {
				source: type,
				type: langTypes[type],
				items: sortedKeys.filter((key) => items[key].type === i).map(key => {
					return {
						name: `${items[key].name} (Ɖ${items[key].price})`,
						description: iTranslate(guild, `descriptions.${items[key].description.toLowerCase()}`, { ns: 'items' }),
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
		/** @param {Boolean} state */
		const components = (state) => [
			new MessageActionRow().addComponents(
				new MessageSelectMenu()
					.setCustomId('shop')
					.setPlaceholder(iTranslate(guild, 'select_category', { ns: 'common' }))
					.setDisabled(state)
					.addOptions(componentOptions),
			),
		];
		// @ts-ignore
		await userInteraction.reply({
			embeds: [embed],
			components: components(false),
		});
		/** @param {import('discord.js').Interaction} i */
		const filter = (i) => {
			// @ts-ignore
			return i.user.id === userInteraction.user.id && i.customId === 'shop';
		};
		const collector = userInteraction.channel.createMessageComponentCollector({
			filter,
			componentType: 'SELECT_MENU',
			time: 120000,
		});

		collector.on('collect', async (collectorInteraction) => {
			const [selectedCategory] = collectorInteraction.values;
			const cat2 = categories.find(cat => cat.source === selectedCategory.toLowerCase());
			const embed2 = new MessageEmbed()
				.setTitle(cat2.type)
				.setColor(EMBED_COLORS.Secondary)
				.setDescription(iTranslate(guild, `shop.category_description.${cat2.source}`))
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
			// @ts-ignore
			userInteraction.editReply({
				embeds: [embed],
				components: components(true),
			});
		});
	},
};
