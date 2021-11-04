const { translate } = require("../../handlers/language"),
    { getActivity } = require("../../handlers/activity"),
    quizDatabase = require("../../models/quizSchema"),
    { MessageEmbed } = require("discord.js");

module.exports = {
    /**
     *
     * @param { Object } interaction - The interaction object.
     * @param { User Object } profileData - The user profile data.
     * @param { Item Object } currentItem - The current item info from the database.
     * @param { Number } amount - The amount of items to be used.
     */
    async use(interaction, profileData, currentItem, amount) {
        const { guild } = interaction;
        if (amount != 1)
            return interaction.reply(translate(guild, "INVALID_AMOUNT"));
        let id = getActivity(interaction.user.id);
        if (!id) {
            interaction.reply(translate(guild, "HINT_AFK"));
            return;
        }

        try {
            let quiz = await quizDatabase.findOne({ _id: id });
            if (!quiz) {
                interaction.reply(translate(guild, "HINT_NO_QUIZ"));
                return;
            }
            // Not implemented.
            // if (quiz.hints.length == 0) {
            //     interaction.reply(translate(guild, "HINT_NO_HINTS"));
            //     return;
            // }
            let fewAlternatives = [quiz.correct_answer, ...quiz.incorrect_answers]
                .slice(0, 3)
                .sort(() => Math.random() - 0.5);

            const embed = new MessageEmbed()
                .setColor(`#39A2A5`)
                .setTitle(translate(guild, 'HINT_SUCCESSFUL_REPLY'))
            ;

            let counter = 0;
            for (const alternative of fewAlternatives){
                counter++;
                embed.addField( counter + '°', '`' + alternative + '`' , true );
            }
            
            interaction.reply({embeds : [embed], ephemeral : true});
            
        } catch (e) {
            interaction.reply(translate(guild, "HINT_NO_QUIZ"));
            console.log(e);
        }
    },
};
