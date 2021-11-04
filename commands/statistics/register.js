const { MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const profileModel = require("../../models/profileSchema");
const { translate } = require('../../handlers/language');
const mustache = require('mustache');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("Create your Kimm account."),
    async execute(interaction, noData, client) {
        const { guild } = interaction;
        let profileData;

        try {
            profileData = await profileModel.findOne({
                userID: interaction.user.id,
            });
            if (!profileData) {
                let profile = await profileModel.create({
                    userID: interaction.user.id,
                    dons: 0,
                });
                profile.save();
                const row = new MessageActionRow().addComponents(
                    new MessageButton()
                        .setCustomId("tutorial")
                        .setLabel("Tutorial")
                        .setStyle("SUCCESS")
                        .setEmoji("📖")
                );
                await interaction.reply({
                    content: mustache.render(translate( guild , 'SUCCESSFUL_REGISTER' ), {
                        user: interaction.user.username,
                    }),
                    components: [row],
                });
                return;
            } else {
                await interaction.reply(mustache.render(translate( guild , 'UNSUCCESSFUL_REGISTER' ), {
                    user: interaction.user.username,
                }));
                return;
            }
        } catch (err) {
            console.log(err);
        }

        const filter = (i) =>
            i.user.id === interaction.user.id && i.customId === 'tutorial';

        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: MessageButton,
            time: 20000,
        });

        collector.on("collect", async (i) => {
            await i.reply("Starting tutorial...");
        });

        collector.on("end", async () => {
            await interaction.editReply("You have finished the tutorial.");
        });
    },
};
