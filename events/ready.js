const client = require('../index');

client.on('ready', () => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
	let status = [
		`slash commands!`,
		`and developing.`,
		`JavaScript and Discord.js`
	];
	let index = 0;

	setInterval(() => {
		client.user.setActivity(status[index], { type: 'WATCHING', buttons: [{ name: 'EloquentJavascript', url: 'https://eloquentjavascript.net'}] });
		index = (index + 1) % status.length;
	}, 50000);
});
