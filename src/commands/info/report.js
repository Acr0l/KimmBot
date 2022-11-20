const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`report`)
        .setDescription(`Placeholder`)
        .addSubcommand((subcommand) =>
        subcommand
            .setName('question')
            .setNameLocalizations({
                "es-ES": 'pregunta'
            })
            .setDescription('Report an issue with a problem (Workout/Warmup/Challenge)')
            .setDescriptionLocalizations({
                "es-ES": "Reportar un problema con un ejercicio (Workout/Warmup/Challenge"
            })
            .addStringOption((option) =>
                option
                    .setName('question-id')
                    .setDescription('Provide the identification to review.')
                    .setRequired(true)
                    )
            .addStringOption((option) =>
                option
                    .setName('issue')
                    .setDescription('Observations to provide insight on what to focus on.')
                    )
        )
        .addSubcommand((subcommand) =>
        subcommand
            .setName('user')
            .setDescription('Report an issue with a user (cheater/bot).')
            .addStringOption((option) =>
                option
                    .setName('user-id')
                    .setDescription('Provide the identification investigate.')
                    .setRequired(true)
                    )
            .addStringOption((option) =>
                option
                    .setName('issue')
                    .setDescription('Observations to provide context.')
                    .setRequired(true)
                    )
        ),
  /**
    * @param { import('discord.js').CommandInteraction } interaction - Object with the interaction data sent by the user.
    */
    async execute(interaction) {
        // @ts-ignore
        logger.info(interaction.options.getSubcommand());
        interaction.reply({ content: 'WIP' });
    }
};
