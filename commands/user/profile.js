const { SlashCommandBuilder } = require('@discordjs/builders');
const profileModel = require('../../models/profileSchema');
const { MessageEmbed } = require('discord.js');
const randomBio = [
    'Se crió en los barrios bajos y se ganó una buena reputación por su astucia y rapidez mental. En poco tiempo logró liderar varias bandas de ladrones con las que ganó mucho dinero. Le gusta la buena vida pero eso podría esta a punto de cambiar pronto. Todos saben que aborrece el mar y los ríos pero nadie sabe la razón. Uno de los jefes mas fuertes de la mafia tiene el ojo puesto en él y no parará hasta verlo muerto en el fondo del mar.',
    'Ha perdido su trabajo y tenido problemas con su pareja, no ha sido un buen año. Se destaca principalmente en los estudios y su belleza, pero recientemente sufrió un accidente que desfiguró su rostro. Busca reencontrarse consigo y conseguir la aprobación del grupo',
    'Trabaja en un periódico, pero odia la ciudad. Se destaca en su sigilo y agilidad, y a veces se deja llevar por la aventura y termina pagando consecuencias. Busca la aprobación de los demás, aunque signifique dejar atrás sus sueños.',
    'Lucha para ganarse el pan, no tiene amigos, solo un poderoso enemigo. Posee una voluntad de hierro, y nadie le gana en la memoria, no obtante, su visión es terrible y necesita un bastón para movilizarse, aunque destaca por su gran honor y fortaleza de alma. Solo desea castigar a quien le ha hecho daño',
    'La policía le pisa los talones. Recientmente asesinaron a un ser querido cercano suyo y fue por venganza. Se destaca por su sigilo y voz encantadora, sin embargo, sufre de obesidad y cojera. Es muy responsable, y haría lo que sea por ganars el respeto de los demás.',
    'Trabajó durante años en minería, y recientemente perdió todo su dinero en el casino. Odia la cuidad. Se destaca por su fuerza y mente prodigiosa, pero sus sueños están rotos, y entró en la drogadicción. Aún tiene la esperaza de poder volver a su humildad característica de antes.'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('See your info'),
    async execute(interaction, profileData) {
        
        let items = profileData.items.length != 0 ? profileData.items.join(',') : 'No items.';
        let cooldowns = profileData.cooldowns.length != 0 ? profileData.cooldowns.join(',') : 'No cooldowns.';
        let stats = profileData.stats.length != 0 ? profileData.stats.join(',') : 'No stats.';
        const bio = randomBio[Math.trunc(Math.random() * randomBio.length)];

        const embed = new MessageEmbed()
            .setColor('#34577A')
            .setTitle(`${interaction.member.nickname}'s profile`)
            .setDescription(bio)
            .setThumbnail("https://cdn.discordapp.com/avatars/" + profileData.userID + "/" + interaction.user.avatar + ".jpeg")
            .addFields(
                { name: 'Level', value: profileData.level.toString(), inline: true },
                { name: 'Experience', value: profileData.experience.toString(), inline: true },
                { name: 'Tier', value: profileData.tier.toString(), inline: true },
                { name: 'Money', value: `Ɖ${profileData.dons}`, inline: true },
                { name: 'Items', value: items, inline: true },
                { name: 'Cooldowns', value: cooldowns, inline: true },
                { name: 'Title', value: profileData.title[0], inline: true },
                { name: 'Stats', value: stats, inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};