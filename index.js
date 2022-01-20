// Require the necessary classes
const { Client, Collection, Intents } = require('discord.js'),
    { token } = require('./config.json'),
    { MONGODB_URI } = require('./config.json'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    path = require('path'),
    logger = require('./logger');

// Create client
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Create a collection for the commands
client.commands = new Collection();
client.subcommands = new Collection();

let tmp = [];
function throughDirectory(dir) {
    fs.readdirSync(dir).forEach((file) => {
        const absolute = path.join(dir, file);
        if (fs.statSync(absolute).isDirectory())
        return throughDirectory(absolute);
        else if (absolute.endsWith('js')) return tmp.push(absolute);
    });
}
throughDirectory('./commands');
let commandFiles = [...tmp];
tmp = [];
throughDirectory('./subcommands');
let subcommandFiles = [...tmp];

for (const file of commandFiles) {
    const command = require(`./${file}`),
        splitted = file.split('\\'),
        directory = splitted[splitted.length - 2];
    command['directory'] = directory;
    command.cooldown = command.cooldown || 3;
    client.commands.set(command.data.name, command);
}

// TODO: Add permissions
// client.commands.forEach((cmd) => {
//     if (cmd.permission) {
//         if (perms.includes(cmd.permission)) {
//             cmd.defaultPermission = false;
//         } else return logger.info(`${cmd.name} has an invalid permission!`);
//     }
// });

for (const file of subcommandFiles) {
    const subcommand = require(`./${file}`);
    const splitted = file.split('\\');
    const directory = splitted[splitted.length - 2];
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    subcommand['directory'] = directory;
    if (subcommand.data.name)
        client.subcommands.set(subcommand.data.name, subcommand);
    else logger.error(`${subcommand} not found`);
}

// module.exports = client;
// Create a collection for the events
const eventFiles = fs
    .readdirSync('./events')
    .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    // eslint-disable-next-line no-unused-vars
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Connect to MongoDB
mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => logger.info('MongoDB Connected'))
    .catch((err) => logger.error(err));

// Login to Discord (token)
client.login(token);
