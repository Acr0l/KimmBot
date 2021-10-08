const { Client, CommandInteraction, MessageEmbed , MessageActionRow , MessageSelectMenu, SnowflakeUtil} = require("discord.js");
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
        let [subject, warmupId] = interaction.values[0].split('-');
        subject = subject.slice(1);
        const question = await quizModel.findOne({ _id: warmupId });
        const answerTime = Math.floor((Date.now() - SnowflakeUtil.deconstruct(interaction.message.id).timestamp) / 1000);
        const meSpent = Math.floor(answerTime * 2) + 3;
        
        
        // Apply ME changes.
        if (answerTime >= 60) {
            await interaction.followUp('No puedes seguir respondiendo.')
            return;
        }

        if (profileData.mentalEnergy.me - meSpent >= 0) {
            if (!profileData.stats.find(stat => stat.subject === subject)) {
                profileData.stats.push({
                    subject: subject,
                    tier: 0,
                    correct: value ? 1 : 0,
                    incorrect: value ? 0 : 1,
                });
            } else {
                const stat = await profileData.stats.findIndex(stat => stat.subject === subject);
                profileData.stats[stat].correct += value ? 1 : 0;
                profileData.stats[stat].incorrect += value ? 0 : 1;
            }

            profileData.mentalEnergy.me -= meSpent;

        } else {
            // Not enough ME
            profileData.mentalEnergy.me = 0;
            await interaction.followUp(`You need at least ${meSpent} ME to answer this question. Your ME has been set to \`0\``)
            await profileData.save();
            return;
        }

        await profileData.save();
        // Variables
        let color, title, description, image, footer;
        
        if (value) {
            // Correct answer
            let xp = Math.floor(Math.random() * (question.difficulty * 2)) + 3 * question.difficulty;
            color = '#80EA98';
            title = `${interaction.user.username} ha respondido correctamente`;
            description = `¡Felicidades ${interaction.user.username}, ganaste **${xp}** de experiencia!\nGastaste ${meSpent} puntos de ME`;
            image = 'https://freepikpsd.com/media/2019/10/correcto-incorrecto-png-7-Transparent-Images.png';
            footer = `Id: ${question._id}`;
            // Update the user's xp
            await applyXp(profileData, xp, interaction);
        } else {
            color = '#eb3434';
            title = `${interaction.user.username} ha respondido incorrectamente`;
            description = `No era esa la respuesta 😔...\nGastaste ${meSpent} puntos de ME`;
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