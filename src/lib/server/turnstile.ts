import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { createLogger } from './logger';

const log = createLogger('turnstile');

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function getSecret(): string {
	const secret = env.TURNSTILE_SECRET_KEY?.trim();
	if (secret) return secret;
	if (!dev)
		throw new Error(
			'TURNSTILE_SECRET_KEY is not set — refusing to verify challenges in production.'
		);
	return '1x0000000000000000000000000000000AA'; // always-passes test key
}

export async function verifyTurnstile(token: string): Promise<boolean> {
	if (!token) return false;

	try {
		const formData = new URLSearchParams();
		formData.set('secret', getSecret());
		formData.set('response', token);

		const response = await fetch(TURNSTILE_VERIFY_URL, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: formData.toString()
		});

		const data = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };

		if (!data.success) {
			log.warn({ errors: data['error-codes'] }, 'turnstile verification failed');
		}

		return data.success === true;
	} catch (err) {
		log.error({ err }, 'turnstile verification error');
		return false;
	}
}
