const client = require('../index'),
    { loadLanguages } = require('../handlers/language'),
    { loadDifficulties } = require('../handlers/difficulty'),
    { loadItems } = require('../handlers/itemInventory'),
    { perms } = require('../util/permissions');

client.once('ready', async () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // Load saved languages
    loadLanguages(client);
    // Load saved difficulties
    loadDifficulties(client);
    // Load saved items
    loadItems();

    client.user.setActivity('anime (educational purposes).', { type: 'WATCHING' });

});
