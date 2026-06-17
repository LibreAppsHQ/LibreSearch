import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';
const level = process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug');

export const logger = pino({
	level,
	formatters: {
		level(label) {
			return { level: label };
		}
	},
	timestamp: pino.stdTimeFunctions.isoTime,
	redact: {
		paths: [
			'email',
			'password',
			'token',
			'authorization',
			'cookie',
			'set-cookie',
			'*.email',
			'*.password',
			'*.token',
			'*.authorization',
			'*.cookie',
			'*.set-cookie',
			'headers.authorization',
			'headers.cookie',
			'headers["x-forwarded-for"]',
			'headers["x-real-ip"]',
			'req.headers.authorization',
			'req.headers.cookie',
			'req.headers["x-forwarded-for"]',
			'req.headers["x-real-ip"]',
			'res.headers["set-cookie"]'
		],
		censor: '[REDACTED]'
	},
	serializers: {
		req: (req) => ({
			method: req.method,
			url: req.url
		}),
		res: (res) => ({
			statusCode: res.statusCode
		}),
		err: pino.stdSerializers.err
	}
});

export function createLogger(name: string): pino.Logger {
	return logger.child({ name });
}
