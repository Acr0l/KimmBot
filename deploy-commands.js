const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');
const path = require('path');

const commands = [];

let commandFiles = [];
function throughDirectory(dir) {
    fs.readdirSync(dir)
        .forEach(file => {
            const absolute = path.join(dir, file);
            if (fs.statSync(absolute).isDirectory()) return throughDirectory(absolute);
            else if (absolute.endsWith('js')) return commandFiles.push(absolute);
        });
}
throughDirectory('./commands');
for (const file of commandFiles) {
    const command = require(`./${file}`);
    if (command.data.name) commands.push(command.data.toJSON());
    else console.log(`${file} has no name`);
    // commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);