// Require the necessary classes
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { token } = require('./config.json');
const { MONGODB_URI } = require('./config.json');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');

// Create client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });

module.exports = client;

// Create a collection for the commands
client.commands = new Collection();

let Files = [];
function ThroughDirectory(dir, array) {
    fs.readdirSync(dir)
        // .filter(file => file.endsWith('.js'))
        .forEach(file => {
            const absolute = path.join(dir, file);
            if (fs.statSync(absolute).isDirectory()) return ThroughDirectory(absolute);
            else return array.push(absolute);
        });
}
ThroughDirectory('./commands', Files);

for (const file of Files) {
    const command = require(`./${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

// Create a collection for the menus
client.selectmenu = new Collection();
const menuFiles = fs.readdirSync('./selectmenus').filter(file => file.endsWith('.js'));

for (const file of menuFiles) {
    const menu = require(`./selectmenus/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.selectmenu.set(menu.name, menu);
}

// Create a collection for the events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
}

// Connect to MongoDB
mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Login to Discord (token)
client.login(token);

