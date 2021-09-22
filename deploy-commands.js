const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [];

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
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
})();