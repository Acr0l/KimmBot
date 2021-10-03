const { Client, CommandInteraction, MessageEmbed , MessageActionRow , MessageSelectMenu} = require("discord.js");
const quizModel = require('../models/quizSchema');
const profileModel = require('../models/profileSchema');
const { applyXp } = require('../util/userfuncs');

module.exports = {
    name: "warmupSelect",
    description: "Selects a warmup",
    run: async (client, interaction, profileData) => {

        let embed;
        
        // Get if the answer is correct.
        const value = interaction.values[0].startsWith('x');
        const [question] = await quizModel.find({ _id: interaction.values[0].substring(1) });

        // Variables
        let color, title, description, image, footer;

        if (value) {
            // Correct answer
            let xp = Math.floor(Math.random() * (question.difficulty * 2)) + 3 * question.difficulty;
            color = '#80EA98';
            title = `${interaction.user.username} ha respondido correctamente`;
            description = `¡Felicidades ${interaction.user.username}, ganaste **${xp}** de experiencia!`;
            image = 'https://freepikpsd.com/media/2019/10/correcto-incorrecto-png-7-Transparent-Images.png';
            footer = `Id: ${question._id}`;
            // Update the user's xp
            await applyXp(profileData, xp, interaction);
        } else {
            color = '#eb3434';
            title = `${interaction.user.username} ha respondido incorrectamente`;
            description = `No era esa la respuesta 😔...`;
            image = 'https://cdn.pixabay.com/photo/2012/04/12/20/12/x-30465_960_720.png';
            footer = `Id: ${question._id}`;
        }

        // Create the embed
        embed = new MessageEmbed()
            .setColor(color)
            .setTitle(title)
            .setDescription(description)
            .setThumbnail(image)
            .setFooter(footer);

        let rowPH = value ? question.correct_answer : '¡Respuesta incorrecta!';
        const row = new MessageActionRow()
            .addComponents(
              new MessageSelectMenu()
                .setCustomId('warmupSelect')
                .setPlaceholder(rowPH)
                .setMinValues(0)
                .setMaxValues(1)
                .addOptions([{label:"nothing" , value: "nothing"}])
                .setDisabled(true)
            )
            
        await interaction.update({ components: [row]});
        await interaction.followUp({ embeds: [embed] });
       
    },
};