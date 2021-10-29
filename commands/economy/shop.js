const { SlashCommandBuilder } = require('@discordjs/builders'),
    {
        MessageEmbed,
        MessageActionRow,
        MessageSelectMenu,
    } = require('discord.js'),
    { getItemList } = require('../../handlers/itemInventory'),
    { translate } = require('../../handlers/language'),
    mustache = require('mustache'),
    itemTypes = ['Equipment', 'Consumable', 'Special Consumable', 'Quest'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`shop`)
        .setDescription(`Display available items.`),
    /**
     * @param { Message } interaction
     * @param { Object } profileData
     * @param { Client } client
     */
    async execute(interaction, profileData, client) {
        const { guild } = interaction;
        const langTypes = translate(guild, 'SHOP_TYPES').split(':');
        const items = getItemList(),
            sortedKeys = Object.keys(items).sort(
                (a, b) => items[a].price - items[b].price,
            ),
            embed = new MessageEmbed()
                .setTitle(translate(guild, 'SHOP_TITLE'))
                .setColor(`#0099ff`)
                .setDescription(translate(guild, 'SHOP_DESCRIPTION'));
        let itemMap = new Map();
        for (let i = 0; i < itemTypes.length; i++) {
            itemMap.set(itemTypes[i], langTypes[i]);
        }
        const types = itemTypes.map((type) => {
            const arrayItems = sortedKeys
                .filter((item) => items[item].type === itemTypes.indexOf(type))
                .map((item) => {
                    return {
                        name: `${items[item].name} (**Ɖ${items[item].price}**)`,
                        description: translate(guild, items[item].description),
                    };
                });
            return {
                type: type,
                items: arrayItems,
            };
        });
        const components = (state) => [
            new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId(`shop`)
                    .setPlaceholder(translate(guild, 'HELP_PLACEHOLDER'))
                    .setDisabled(state)
                    .addOptions(
                        types.map((type) => {
                            return {
                                label: itemMap.get(type.type),
                                value: type.type,
                                description: translate(
                                    guild,
                                    `SHOP_${type.type.replace(/\s/g, '_').toUpperCase()}_TYPE`,
                                ),
                            };
                        }),
                    ),
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

        collector.on('collect', (i) => {
            const [iType] = i.values;
            const category = types.find((type) => type.type === iType),
                categoryEmbed = new MessageEmbed()
                    .setTitle(translate(guild, 'SHOP_TITLE'))
                    .setColor('#80EA98')
                    .setDescription(translate(guild, 'SHOP_DESCRIPTION'))
                    .setFields(
                        category.items.map((item) => {
                            return {
                                name: item.name,
                                value: item.description,
                            };
                        }),
                    );
            i.update({ embeds: [categoryEmbed] });
        });

        collector.on('end', () => {
            interaction.reply({
                embeds: [embed],
                components: components(true),
            });
        });
    },
};
