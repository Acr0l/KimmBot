const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { readdirSync } = require('fs');
const client = require('../../index')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Short description about the available commands.'),
    async execute(interaction, profileData) {

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
                            return {
                                label: cmd.directory,
                                value: cmd.directory.toLowerCase(),
                                description: `Commands from ${cmd.directory} category.`
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
            time: 20000,
        });

        collector.on('collect', (i) => {
            const [directory] = i.values;
            const category = categories.find(cat => cat.directory.toLowerCase() == directory.toLowerCase());

            const categoryEmbed = new MessageEmbed()
                .setTitle(`${formatString(directory)} commands`)
                .setDescription(`Set desc.`)
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
            // .setColor('#57CC98')
            // .setAuthor('Kimm Bot Team','https://i.imgur.com/dSavUpW.png')            
            // .setThumbnail('https://i.imgur.com/dSavUpW.png')

        // await interaction.reply({embeds: [embed] });
    },
};