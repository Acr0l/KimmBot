const { Client, CommandInteraction, MessageEmbed } = require("discord.js");

module.exports = {
    name: "warmupSelect",
    description: "Selects a warmup",
    run: async (client, interaction, args) => {

        if (interaction.customId === 'warmupSelect') {
            const value = interaction.values[0];
            const username = interaction.user.username;

            if (value == 'A') {
                const embed = new MessageEmbed()
                    .setColor('#80EA98')
                    //.setAuthor('Warm up...')
                    //.setAuthor('Kimm Bot', 'https://i.imgur.com/AfFp7pu.png', 'https://discord.js.org')
                    .setTitle("Respuesta correcta " + username + " 😎👍")
                    .setThumbnail('https://freepikpsd.com/media/2019/10/correcto-incorrecto-png-7-Transparent-Images.png')
                    .setFooter('Ahora callate callao');
                interaction.update({ embeds: [embed], components: [], ephemeral: true });
            }
            else {
                const embed = new MessageEmbed()
                    .setColor('#eb3434')
                    //.setAuthor('Warm up...')
                    //.setAuthor('Kimm Bot', 'https://i.imgur.com/AfFp7pu.png', 'https://discord.js.org')
                    .setTitle("Pta " + username + " que eri aweonao 🙄")
                    .setThumbnail('https://cdn.pixabay.com/photo/2012/04/12/20/12/x-30465_960_720.png')
                    .setFooter('Respuesta incorrecta por si acaso');
                interaction.update({ embeds: [embed], components: [], ephemeral: true });
            }

        }

        else {
            interaction.reply('Callate callao');
        }
    },
};