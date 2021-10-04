const client = require('../index');

client.on('ready', () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
	let status = [
		`with slash commands!`,
		`and developing.`,
		`with JavaScript`
	];
	let index = 0;

	setInterval(() => {
		client.user.setActivity(status[index], { type: 'WATCHING' });
		index = (index + 1) % status.length;
	}, 50000);
});
