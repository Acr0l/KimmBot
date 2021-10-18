const { MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const profileModel = require("../../models/profileSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("Create your Kimm account."),
    async execute(interaction, noData, client) {
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
                    content:
                        "You have successfully registered, click the button to begin the tutorial!",
                    components: [row],
                });
                return;
            } else {
                await interaction.reply("You already have a Kimm account.");
                return;
            }
        } catch (err) {
            console.log(err);
        }

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: MessageButton,
            time: 20000,
        });

        collector.on("collect", async (i) => {
            if (!i.customId === "tutorial") return;
            if (!i.user.id === interaction.user.id) return;

            await interaction.reply("Starting tutorial...");
        });

        collector.on("end", async () => {
            await interaction.editReply("You have finished the tutorial.");
        });
    },
};
