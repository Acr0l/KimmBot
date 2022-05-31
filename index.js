// Require the necessary classes
const { Client, Collection, Intents } = require('discord.js'),
	{ token, MONGODB_URI } = require('./config.json'),
	fs = require('fs'),
	mongoose = require('mongoose'),
	path = require('path'),
	logger = require('./logger'),
	i18next = require('i18next'),
	i18nextBackend = require('i18next-fs-backend');

i18next.use(i18nextBackend).init(
	{
		initImmediate: false,
		lng: 'en',
		fallbackLng: 'en',
		preload: ['en', 'es'],
		ns: ['common', 'validation', 'glossary'],
		defaultNS: 'common',
		fallbackNS: 'glossary',
		backend: {
			loadPath: 'locales/{{lng}}/{{ns}}.json',
		},
	},
	(err, t) => {
		if (err) return logger.error(err);
		logger.info(
			t('i18next_startup', { lng: Math.random() > 0.5 ? 'en' : 'es' }),
		);
	},
);

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
		if (fs.statSync(absolute).isDirectory()) {return throughDirectory(absolute);}
		else if (absolute.endsWith('js')) {return tmp.push(absolute);}
	});
}
throughDirectory('./commands');
const commandFiles = [...tmp];
tmp = [];
throughDirectory('./subcommands');
const subcommandFiles = [...tmp];

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
	if (subcommand.data.name) {client.subcommands.set(subcommand.data.name, subcommand);}
	else {logger.error(`${subcommand} not found`);}
}

// module.exports = client;
// Create a collection for the events
const eventFiles = fs
	.readdirSync('./events')
	.filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

process.on('unhandledRejection', (error) => {
	logger.error('Unhandled promise rejection:', error);
});

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
