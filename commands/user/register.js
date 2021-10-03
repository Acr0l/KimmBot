const { SlashCommandBuilder } = require('@discordjs/builders');
const profileModel = require('../../models/profileSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Start Kimm account.'),
    async execute(interaction, ...args) {

        let profileData;

        try {
            profileData = await profileModel.findOne({ userID: interaction.user.id });
            if (!profileData) {
                let profile = await profileModel.create({
                    userID: interaction.user.id,
                    dons: 0
                });
                profile.save();
                await interaction.reply('You have successfully registered, type `tutorial` to begin!');
                return;
            }
            else {
                await interaction.reply('You already have a Kimm account.');
                return;
            }
        }
        catch (err) {
            console.log(err);
        }
        
    },
};
