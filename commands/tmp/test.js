const { SlashCommandBuilder } = require('@discordjs/builders'),
    {
        MessageEmbed,
        MessageActionRow,
        MessageButton,
        MessageSelectMenu,
    } = require('discord.js');

const question = {
    subject: 'Math',
    difficulty: '0',
    question:
        'Abajo hay un Cuadrado Mágico que usa los números 1-16. Las filas, columnas y diagonales deben sumar exactamente lo mismo. Coloca los últimos cuatro números en los cuadrados apropiados.',
    correct_answer: ['3', '12', '14', '5'],
    incorrect_answers: [],
    image: 'https://i.imgur.com/nxMHO40.png',
    type: 'SEQ',
    category: 'Challenge',
    lang: 'es',
};
module.exports = {
    data: new SlashCommandBuilder()
        .setName(`test`)
        .setDescription(`Test different commands`),
    /**
     * @param { Message } interaction
     * @param { Object } profileData
     * @param { Client } client
     */
    async execute(interaction, profileData, client) {
        await interaction.deferReply();
        const embed = new MessageEmbed()
                .setTitle(`${question.subject} - ${question.difficulty}`)
                .setDescription(question.question)
                .setFooter(`${question.type} - ${question.category}`)
                .setImage(question.image),
            row = new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId('challengeAnswer')
                    .setPlaceholder('Selecciona una alternativa')
                    .setOptions(
                        question.correct_answer.map((answer) => {
                            return { label: answer, value: answer };
                        }),
                    ),
            ),
            scoreWithEmojis = [],
            filter = (i) =>
                i.customId === 'challengeAnswer' &&
                i.user.id == interaction.user.id;
        let counter = 0;
        if (Math.sqrt(question.correct_answer.length) % 1 === 0) {
            // Make a 2D array
            for (
                let j = 0;
                j < Math.sqrt(question.correct_answer.length);
                j++
            ) {
                scoreWithEmojis.push([]);
            }
            // Fill the 2D array
            for (let i = 0; i < question.correct_answer.length; i++) {
                scoreWithEmojis[i % scoreWithEmojis.length].push('🔳');
            }
        }
        let [rowIndex, columnIndex] = getByIndex(scoreWithEmojis, counter);
        scoreWithEmojis[rowIndex][columnIndex] = '⚪';
        await interaction.editReply({
            embeds: [embed],
        });
        interaction.followUp({
            content: scoreWithEmojis.map((e) => e.join(' ')).join('\n'),
            components: [row],
        });
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            componentType: 'SELECT_MENU',
            time: 60000,
        });
        collector.on('collect', async (i) => {
            const [answer] = i.values;
            [rowIndex, columnIndex] = getByIndex(scoreWithEmojis, counter);
            if (answer === question.correct_answer[counter]) {
                scoreWithEmojis[rowIndex][columnIndex] =
                    scoreWithEmojis[rowIndex][columnIndex] === '⚪'
                        ? '🟢'
                        : '🟡';
            } else {
                if (scoreWithEmojis[rowIndex][columnIndex] === '⚪') {
                    scoreWithEmojis[rowIndex][columnIndex] = '🟡';
                    await i.update({
                        content: scoreWithEmojis
                            .map((e) => e.join(' '))
                            .join('\n'),
                        components: [row],
                    });
                    return;
                }
                scoreWithEmojis[rowIndex][columnIndex] = '🔴';
            }
            counter++;
            if (counter !== question.correct_answer.length) {
                [rowIndex, columnIndex] = getByIndex(scoreWithEmojis, counter);
                scoreWithEmojis[rowIndex][columnIndex] = '⚪';
            }
            await i.update({
                content: scoreWithEmojis.map((e) => e.join(' ')).join('\n'),
                components: [row],
            });
            if (counter == question.correct_answer.length) {
                collector.stop('completed');
            }
        });
        collector.on('end', async (collected, reason) => {
            if (reason === 'completed' || collected.size !== 0) {
                const score = numOfOccurrences(scoreWithEmojis, '🟢'),
                    halfPoint = numOfOccurrences(scoreWithEmojis, '🟡');
                await interaction.editReply({
                    components: [],
                });
                await interaction.followUp({
                    content: `${score + halfPoint / 2}/${
                        question.correct_answer.length
                    }`,
                });
            } else {
                interaction.editReply({
                    components: [],
                    content: 'Tiempo agotado',
                });
            }
        });
    },
};

const getByIndex = (array, index) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i].length > index) return [i, index];
        index -= array[i].length;
    }
    return [0, 0];
};

const numOfOccurrences = (array, value) => {
    let counter = 0;
    for (let i = 0; i < array.length; i++) {
        if (Array.isArray(array[i])) {
            counter += numOfOccurrences(array[i], value);
        } else {
            if (array[i] === value) counter++;
        }
    }

    return counter;
};
