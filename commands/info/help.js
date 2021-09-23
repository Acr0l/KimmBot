const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { readdirSync } = require('fs');
const client = require('../..');

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

        const initialMessage = await interaction.reply({
            embeds: [embed],
            components: components(false),
            ephemeral: false
        });

        const filter = (interaction) => interaction.user.id == interaction.author.id;
        
        const collector = interaction.channel.createMessageCollector({
            componentType: "SELECT_MENU", 
        });

        collector.on('collect', (interaction) => {
            const [directory] = interaction.values;
            const category = categories.find(cat => cat.directory.toLowerCase() == directory.toLowerCase());

            const categoryEmbed = new MessageEmbed()
                .setTitle(`${directory} commands`)
                .setDescription(`Set desc.`)
                .setFields(category.commands.map(cmd => {
                    return {
                        name: `\`${cmd.data.name}\``,
                        value: cmd.data.description,
                        inline: true
                    };
                }));

            interaction.edit({ embeds: [categoryEmbed] });
        });

        collector.on('end', () => {
            initialMessage.editReply({ components: components(true) });
        });
            // .setColor('#57CC98')
            // .setAuthor('Kimm Bot Team','https://i.imgur.com/dSavUpW.png')            
            // .setThumbnail('https://i.imgur.com/dSavUpW.png')
            // .setTitle("Kimm Bot")
            // .setDescription('Kimm Bot is a Discord bot that provides a game-like experience for players to study and compete with each other.\n \n The game is played using the Application Interactions provided by Discord, where the players will have levels and experience points, many subjects to study, and a leaderboard to rank the players according to their performance in the game.\n \n They will also have a Tier system to unlock new features and unlock new questions that will provide them more experience points and other benefits. Currerncy used is **Dons (Ɖ)**.')
            // .addFields(
            //     {name: "Statistics commands" , value: "`/profile` `/stats` `/inv`"},
            //     {name: "Money and Items commands" , value: "`/shop` `/buy`"},
            //     {name: "Educational commands" , value: "`/subjects` `/warmup` `/workout` `/challenge` `/kimmtest` `/suggest`"},
            // );

        // await interaction.reply({embeds: [embed] });
        await interaction.reply({ content: 'Sup', ephemeral: true });
    },
};