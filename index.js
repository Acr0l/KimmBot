// Require the necessary classes
const { Client, Collection, Intents, MessageEmbed } = require('discord.js'),
    { token } = require('./config.json'),
    { MONGODB_URI } = require('./config.json'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    path = require('path');

// Create client
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
});

module.exports = client;

// Create a collection for the commands
client.commands = new Collection();
client.subcommands = new Collection();

let tmp = [],
    subcommandFiles = [],
    commandFiles = [];
function throughDirectory(dir) {
    fs.readdirSync(dir).forEach((file) => {
        const absolute = path.join(dir, file);
        if (fs.statSync(absolute).isDirectory())
            return throughDirectory(absolute);
        else if (absolute.endsWith('js')) return tmp.push(absolute);
    });
}
throughDirectory('./commands');
commandFiles = [...tmp];
tmp = [];
throughDirectory('./subcommands');
subcommandFiles = [...tmp];

for (const file of commandFiles) {
    const command = require(`./${file}`);
    const splitted = file.split('\\');
    const directory = splitted[splitted.length - 2];
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    command['directory'] = directory;
    if (command.permission) command['permission'] = command.permission;
    if (command.cooldown) command['cooldown'] = command.cooldown;
    if (command.data.name) client.commands.set(command.data.name, command);
    else console.log(`${command} not found`);
}

client.commands.forEach((cmd) => {
    if (cmd.permission) {
        if (perms.includes(cmd.permission)) {
            cmd.defaultPermission = false;
        } else return console.log(`${cmd.name} has an invalid permission!`);
    }
});

for (const file of subcommandFiles) {
    const subcommand = require(`./${file}`);
    const splitted = file.split('\\');
    const directory = splitted[splitted.length - 2];
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    subcommand['directory'] = directory;
    if (subcommand.data.name)
        client.subcommands.set(subcommand.data.name, subcommand);
    else console.log(`${subcommand} not found`);
}

// Create a collection for the events
const eventFiles = fs
    .readdirSync('./events')
    .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
}

// Connect to MongoDB
mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

// Login to Discord (token)
client.login(token);
