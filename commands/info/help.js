const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { readdirSync } = require('fs');

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

        // Get the commands
        const directories = readdirSync('./commands', { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const formatString = str => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;
        const categories = directories.map((dir) => {
            const getCommands = client.commands
                .filter(cmd => cmd.directory == dir)
                .map((cmd) => {
                    return {
                        name: cmd.data.name,
                        description: cmd.data.description
                    };
                });
            return {
                directory: formatString(dir),
                commands: getCommands,
            };
        });
        const embed = new MessageEmbed()
            .setDescription('Please choose a category in the dropdown menu.');

        const components = (state) => [
            new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId("help-menu")
                    .setPlaceholder("Select a category")
                    .setDisabled(state)
                    .addOptions(
                        categories.map((cmd) => {
                            const { emoji } = require(`../${cmd.directory.toLowerCase()}/desc.json`) || null;
                            return {
                                label: cmd.directory,
                                value: cmd.directory.toLowerCase(),
                                description: `Commands from ${cmd.directory} category.`,
                                emoji: emoji
                            };
                        })
                    )
            ),
        ];

        await interaction.reply({
            embeds: [embed],
            components: components(false)
        });

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: "SELECT_MENU",
            // time: 20000,
        });

        collector.on('collect', (i) => {
            const [directory] = i.values;
            const category = categories.find(cat => cat.directory.toLowerCase() == directory.toLowerCase());
            const { description } = require(`../${directory}/desc.json`) || 'No description yet';

            const categoryEmbed = new MessageEmbed()
                .setTitle(`${formatString(directory)} commands`)
                .setDescription(description)
                .setFields(category.commands.map(cmd => {
                    return {
                        name: `\`${cmd.name}\``,
                        value: cmd.description,
                        inline: true
                    };
                }));

            i.update({ embeds: [categoryEmbed] });
        });

        collector.on('end', () => {
            interaction.editReply({ 
                embeds: [embed], 
                components: components(true) 
            });
        });
    },
};