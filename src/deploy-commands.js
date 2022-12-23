const fs = require("fs"),
  { REST } = require("@discordjs/rest"),
  { Routes } = require("discord-api-types/v9"),
  { clientId, guildId, token } = require("./config.json"),
  path = require("path"),
  logger = require("./logger");

const commands = [];
const commandFiles = [];
function throughDirectory(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const absolute = path.join(dir, file);
    if (fs.statSync(absolute).isDirectory()) return throughDirectory(absolute);
    else if (absolute.endsWith("js")) return commandFiles.push(absolute);
  });
}
throughDirectory(__dirname + "\\commands");
for (const file of commandFiles) {
  if (process.argv.includes("--global") && /tmp/.test(file)) continue;
  const command = require(`${file}`);
  if (command.data.name) commands.push(command.data.toJSON());
  else logger.info(`${file} has no name`);
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    logger.info("Started refreshing application (/) commands.");

    if (
      process.argv.includes("--global") &&
      !process.argv.includes("--delete")
    ) {
      rest
        .put(Routes.applicationCommands(clientId), { body: commands })
        .then(() => {
          logger.info("Successfully reloaded application global (/) commands.");
        })
        .catch((err) => {
          logger.error(
            "Failed to reload application global (/) commands.",
            err
          );
        });
    } else if (process.argv.includes("--delete")) {
      // Example: node src/deploy-commands.js --global --delete 970099038865227812
      logger.info("Deleting...");
      rest
        .delete(
          process.argv.includes("--global")
            ? Routes.applicationCommand(clientId, process.argv[4])
            : Routes.applicationGuildCommand(clientId, guildId, process.argv[3])
        )
        .then(() => logger.info("Successfully deleted"))
        .catch((err) => logger.error(err));
    } else {
      rest
        .put(Routes.applicationGuildCommands(clientId, guildId), {
          body: commands,
        })
        .then(() => {
          logger.info("Successfully reloaded application (/) commands.");
        })
        .catch((err) => {
          logger.error("Failed to reload application (/) commands.", err);
        });
    }
  } catch (error) {
    logger.error(error);
  }
})();

// Delete all commands (global)
// rest.get(Routes.applicationCommands(clientId))
//     .then(data => {
//         const promises = [];
//         for (const command of data) {
//             const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}`;
//             promises.push(rest.delete(deleteUrl));
//         }
//         return Promise.all(promises);
//     });
