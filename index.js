// Require the necesaary discord.js classes

const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');

// Create client
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

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

