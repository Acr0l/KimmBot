// Require the necesaary discord.js classes

const { Client, Collection, Intents, MessageEmbed  } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');

// Create client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

// const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

// for (const file of eventFiles) {
//     const event = require(`./events/${file}`);
//     // Bind the client to the event, and the execute the function
//     // This will make the client available inside the event file
//     if (event.once) {
//         client.once(event.name, (...args) => event.execute(client, ...args));
//     } else {
//         client.on(event.name, (...args) => event.execute(client, ...args));
//     }
// }

// When client is ready, run code (once)
client.once('ready', () => {
    console.log('All ready sir!');
});

// Initializing the commands.
client.on('interactionCreate', async interaction => {
    if (interaction.isSelectMenu())
    {
        if (interaction.customId === 'warmupSelect')
        {
            const value = interaction.values[0];
            const username = interaction.user.username; 

            if(value == 'A')
            {
                const embed = new MessageEmbed()
                .setColor('#80EA98')
                //.setAuthor('Warm up...')
                //.setAuthor('Kimm Bot', 'https://i.imgur.com/AfFp7pu.png', 'https://discord.js.org')
                .setTitle("Respuesta correcta " + username + " 😎👍")
                .setThumbnail('https://freepikpsd.com/media/2019/10/correcto-incorrecto-png-7-Transparent-Images.png')
                .setFooter('Ahora callate callao');
                interaction.update({ embeds:[embed], components:[] , ephemeral : true });
            }
            else
            {
                const embed = new MessageEmbed()
                .setColor('#eb3434')
                //.setAuthor('Warm up...')
                //.setAuthor('Kimm Bot', 'https://i.imgur.com/AfFp7pu.png', 'https://discord.js.org')
                .setTitle("Pta " + username + " que eri aweonao 🙄")
                .setThumbnail('https://cdn.pixabay.com/photo/2012/04/12/20/12/x-30465_960_720.png')
                .setFooter('Respuesta incorrecta por si acaso');
                interaction.update({ embeds:[embed], components: [], ephemeral : true });
            }
            
        }

        else

        {
            interaction.reply('Callate callao');
        }
    }

    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Ups! Hubo un problema con ese comando...', ephemeral: true });
    }

   
});

// Login to Discord (token)
client.login(token);

