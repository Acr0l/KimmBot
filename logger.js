const pino = require('pino');
// @ts-ignore
module.exports = pino({
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			ignore: 'pid,hostname',
			destination: 1,
			translateTime: 'SYS:dd-mm-yyyy HH:mm:ss',
		},
	},
});
