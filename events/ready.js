const client = require('../index'),
    { loadLanguages } = require('../handlers/language'),
    { loadDifficulties } = require('../handlers/difficulty'),
    { loadItems } = require('../handlers/itemInventory');

client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // Load saved languages
    loadLanguages(client);
    // Load saved difficulties
    loadDifficulties(client);
    // Load saved items
    loadItems();

    client.user.setActivity('anime (educational purposes).', { type: 'WATCHING' });
    client.user.setStatus('idle');
});
