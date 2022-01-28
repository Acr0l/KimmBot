const { SlashCommandBuilder } = require('@discordjs/builders'),
    {
        MessageEmbed,
        MessageActionRow,
        MessageSelectMenu,
    } = require('discord.js'),
    { readdirSync } = require('fs'),
    { translate } = require('../../handlers/language'),
    mustache = require('mustache'),
    logger = require('../../logger'),
    { iTranslate } = require('../../handlers/language');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Short description about the available commands.'),

    /**
     *
     * @param { Object } interaction - Object with the interaction data sent by the user.
     * @param { Object } profileData - Object from the database with the user profile data.
     * @param { Object } client - The discord.js client object.
     */
    async execute(interaction, profileData, client) {
        // const {info, statistics } =
        //     i18next.t('help.category_embed.descriptions', {
        //         ns: 'glossary',
        //         returnObjects: true,
        //     });
        // Get guild.
        const { guild } = interaction,
            ns = 'glossary',
            // Get the language.
            langDirectories = translate(guild, 'HELP_DIRECTORIES').split(':'),
            // Get the commands
            directories = readdirSync('./commands', { withFileTypes: true })
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);

        directories.move(directories.indexOf('info'), 0);
        directories.move(directories.indexOf('statistics'), 1);
        directories.move(directories.indexOf('problems'), 2);
        directories.move(directories.indexOf('economy'), 3);

        let langMap = new Map();
        for (let i = 0; i < langDirectories.length; i++) {
            langMap.set(directories[i], langDirectories[i]);
        }

        const formatString = (str) =>
            `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;
        const categories = directories.map((dir) => {
            const getCommands = client.commands
                .filter((cmd) => cmd.directory == dir)
                .map((cmd) => {
                    return {
                        name: cmd.data.name,
                        description: cmd.data.description,
                    };
                });
            return {
                directory: formatString(dir),
                commands: getCommands,
            };
        });
        const embed = new MessageEmbed()
            .setTitle(translate(guild, 'HELP_TITLE_CHOOSE'))
            .setDescription(translate(guild, 'HELP_CHOOSE_CAT'));
        const startEmbed = new MessageEmbed()
            .setTitle(iTranslate(guild, 'help.start_embed.title', { ns }))
            .setDescription(
                iTranslate(guild, 'help.start_embed.description', { ns }),
            )
            .setColor('#C7F8CB');

        const components = (state) => [
            new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId('help-menu')
                    .setPlaceholder(iTranslate(guild, 'help.row.placeholder', {ns}))
                    .setDisabled(state)
                    .addOptions(
                        categories.map((cmd) => {
                            const { emoji } =
                                require(`../${cmd.directory.toLowerCase()}/desc.json`) ||
                                null;
                            return {
                                label: langMap.get(cmd.directory.toLowerCase()),
                                value: cmd.directory.toLowerCase(),
                                description: mustache.render(
                                    translate(guild, 'HELP_ROW_DESC'),
                                    { category: cmd.directory },
                                ),
                                emoji: emoji,
                            };
                        }),
                    ),
            ),
        ];

        await interaction.reply({
            embeds: [embed],
            components: components(false),
        });
        const followUp = await interaction.followUp({ embeds: [startEmbed] });
        const filter = (i) => i.customId == 'help-menu';
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'SELECT_MENU',
            time: 40000,
        });

        collector.on('collect', (i) => {
            const [directory] = i.values;
            const category = categories.find(
                (cat) => cat.directory.toLowerCase() == directory.toLowerCase(),
            );
            const { description } =
                require(`../${directory}/desc.json`) || 'No description yet';

            const categoryEmbed = new MessageEmbed()
                .setTitle(
                    mustache.render(translate(guild, 'HELP_CAT_EMBED_TITLE'), {
                        category: langMap.get(directory),
                    }),
                )
                .setDescription(translate(guild, description))
                .setColor('#80EA98')
                .setFields(
                    category.commands.map((cmd) => {
                        return {
                            name: `\`${cmd.name}\``,
                            value: translate(
                                guild,
                                `CMD_${cmd.name.toUpperCase()}`,
                            ),
                            inline: true,
                        };
                    }),
                );

            i.update({ embeds: [categoryEmbed] });
        });

        collector.on('end', () => {
            interaction.editReply({
                embeds: [embed],
                components: components(true),
            });
        });
    },
};

Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};
