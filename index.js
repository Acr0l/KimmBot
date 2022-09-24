// Require the necessary classes
const {
  Collection,
  Client,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const { token, MONGODB_URI } = require("./config.json"),
  fs = require("fs"),
  mongoose = require("mongoose"),
  path = require("path"),
  logger = require("./logger"),
  i18next = require("i18next"),
  i18nextBackend = require("i18next-fs-backend");

// @ts-ignore
i18next.use(i18nextBackend).init(
  {
    initImmediate: false,
    lng: "en",
    fallbackLng: "en",
    preload: ["en", "es"],
    ns: ["common", "validation", "glossary", "items", "problem"],
    defaultNS: "common",
    fallbackNS: "glossary",
    backend: {
      loadPath: "locales/{{lng}}/{{ns}}.json",
    },
  },
  (err, t) => {
    if (err) return logger.error(err);
    logger.info(
      t("i18next_startup", { lng: Math.random() > 0.5 ? "en" : "es" })
    );
  }
);

// Create client
/**
 * @type {Client} client
 */
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Channel],
});

// Create a collection for the commands
// @ts-ignore
client.commands = new Collection();
// @ts-ignore
client.subcommands = new Collection();

/**
 * Iterate through the commands directory and add them to the respective collection
 * @param {String} dir The directory to search
 * @param {String[]} [arr] Accumulator for the directories
 * @returns {String[]}
 */
const throughDirectory = (dir, arr = []) => {
  fs.readdirSync(dir).forEach((file) => {
    const absolute = path.join(dir, file);
    if (fs.statSync(absolute).isDirectory()) {
      return throughDirectory(absolute, arr);
    } else if (absolute.endsWith("js")) {
      return arr.push(absolute);
    }
  });
  return arr;
};

const commandFiles = [...throughDirectory(path.join(__dirname, "commands"))];
const subcommandFiles = [
  ...throughDirectory(path.join(__dirname, "subcommands")),
];

for (const file of commandFiles) {
  const command = require(`${file}`),
    splitted = file.split("\\"),
    directory = splitted[splitted.length - 2];
  command["directory"] = directory;
  command.cooldown = command.cooldown || 3;
  // @ts-ignore
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
  const subcommand = require(`${file}`);
  const splitted = file.split("\\");
  const directory = splitted[splitted.length - 2];

  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  subcommand["directory"] = directory;
  if (subcommand.data.name) {
    // @ts-ignore
    client.subcommands.set(subcommand.data.name, subcommand);
  } else {
    logger.error(`${subcommand} not found`);
  }
}

// Create a collection for the events
/**
 * @type {String[]} eventFiles
 */
const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection: ", error);
});

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => logger.info("MongoDB Connected"))
  .catch((err) => logger.error(err));

// Login to Discord (token)
client.login(token);
