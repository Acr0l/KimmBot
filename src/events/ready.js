const { ActivityType } = require("discord.js");
const { loadLanguages } = require("../handlers/language"),
  { loadDifficulties } = require("../handlers/difficulty"),
  { loadItems } = require("../handlers/itemInventory"),
  logger = require("../logger");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    logger.info(`Ready! Logged in as ${client.user.tag}`);

    // Load saved languages
    loadLanguages(client);
    // Load saved difficulties
    loadDifficulties();
    // Load saved items
    loadItems();

    client.user.setPresence({
      activities: [
        { name: "anime (for science!)", type: ActivityType.Watching },
      ],
      status: "online",
    });
  },
};
