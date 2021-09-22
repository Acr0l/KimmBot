const client = require('../index');

client.once('ready', () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
	client.user.setActivity('with JavaScript.');
});
