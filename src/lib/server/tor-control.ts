import net from 'node:net';
import { env } from '$env/dynamic/private';

// Talks to the Tor control port to read the live circuit a search travelled
// through. Powers the "view circuit" dropdown next to the search bar. Requires
// the Tor daemon to expose a ControlPort; configure via:
//   TOR_CONTROL_HOST     (default 127.0.0.1)
//   TOR_CONTROL_PORT     (default 9051)
//   TOR_CONTROL_PASSWORD (matches HashedControlPassword in torrc; default empty)
// If the control port is unreachable, callers get null and the UI degrades.

export interface TorHop {
	position: number;
	role: 'guard' | 'middle' | 'exit';
	nickname: string;
	fingerprint: string;
	ip: string | null;
	country: string | null;
}

export interface TorCircuit {
	id: string;
	hops: TorHop[];
}

function getConfig() {
	return {
		host: env.TOR_CONTROL_HOST?.trim() || '127.0.0.1',
		port: Number(env.TOR_CONTROL_PORT?.trim() || '9051'),
		password: env.TOR_CONTROL_PASSWORD ?? ''
	};
}

export function isTorControlConfigured(): boolean {
	// The control port is opt-in; treat an explicit empty host as "disabled".
	return (env.TOR_CONTROL_HOST?.trim() ?? '127.0.0.1') !== '';
}

// A tiny line-oriented control-protocol client. Sends a sequence of commands and
// resolves with the raw reply text for each, then closes the connection.
function controlSession(commands: string[]): Promise<string[]> {
	const { host, port, password } = getConfig();

	return new Promise((resolve, reject) => {
		const socket = net.connect({ host, port });
		socket.setEncoding('utf8');
		socket.setTimeout(8000);

		const replies: string[] = [];
		let buffer = '';
		// Command 0 is always AUTHENTICATE; the rest are the caller's commands.
		const queue = [`AUTHENTICATE "${password}"`, ...commands, 'QUIT'];
		let sent = 0;

		const fail = (err: Error) => {
			socket.destroy();
			reject(err);
		};

		socket.on('connect', () => {
			socket.write(queue[sent++] + '\r\n');
		});
		socket.on('timeout', () => fail(new Error('TOR_CONTROL_TIMEOUT')));
		socket.on('error', (err) => fail(err));

		socket.on('data', (chunk: string) => {
			buffer += chunk;
			// A reply ends with a status line: "250 ..." / "5xx ...". Split on the
			// boundary after each terminal status line.
			let idx: number;
			while ((idx = indexOfReplyEnd(buffer)) !== -1) {
				const reply = buffer.slice(0, idx);
				buffer = buffer.slice(idx);

				// The first reply is the AUTHENTICATE result.
				if (sent === 1) {
					if (!/^250/.test(reply.trim())) return fail(new Error('TOR_CONTROL_AUTH_FAILED'));
				} else {
					replies.push(reply);
				}

				if (sent < queue.length) {
					socket.write(queue[sent++] + '\r\n');
				} else {
					socket.end();
				}
			}
		});

		socket.on('close', () => resolve(replies));
	});
}

// Find the end of one complete control reply: a line beginning "NNN " (space,
// not '-' or '+') marks the final line of a reply.
function indexOfReplyEnd(buf: string): number {
	const lines = buf.split('\r\n');
	let offset = 0;
	for (const line of lines) {
		offset += line.length + 2;
		if (/^\d{3} /.test(line)) return offset;
	}
	return -1;
}

function roleFor(position: number, total: number): TorHop['role'] {
	if (position === 0) return 'guard';
	if (position === total - 1) return 'exit';
	return 'middle';
}

// Parse a single "GETINFO ns/id/$fp" reply into IP + nickname. The router-status
// "r" line is: r <nickname> <id-b64> <digest> <date> <time> <IP> <ORPort> <DirPort>
function parseNsReply(reply: string): { nickname: string | null; ip: string | null } {
	for (const line of reply.split('\r\n')) {
		const m = line.match(/^r\s+(\S+)\s+\S+\s+\S+\s+\S+\s+\S+\s+(\d{1,3}(?:\.\d{1,3}){3})\s+\d+/);
		if (m) return { nickname: m[1], ip: m[2] };
	}
	return { nickname: null, ip: null };
}

function parseCountryReply(reply: string, ip: string): string | null {
	const m = reply.match(new RegExp(`ip-to-country/${ip.replace(/\./g, '\\.')}=(\\w+)`));
	return m && m[1] !== '??' ? m[1].toUpperCase() : null;
}

// Returns the most recently built GENERAL-purpose, multi-hop circuit — the kind
// Tor uses to carry exit traffic like our search requests — with each hop's IP
// and country resolved. Null if the control port can't be read.
export async function getActiveCircuit(): Promise<TorCircuit | null> {
	if (!isTorControlConfigured()) return null;

	let statusReply: string;
	try {
		[statusReply] = await controlSession(['GETINFO circuit-status']);
	} catch {
		return null;
	}
	if (!statusReply) return null;

	type Raw = { id: string; hops: { fingerprint: string; nickname: string }[]; created: number };
	const circuits: Raw[] = [];

	for (const line of statusReply.split('\r\n')) {
		// e.g. "10 BUILT $FP~nick,$FP~nick,$FP~nick PURPOSE=GENERAL TIME_CREATED=..."
		const m = line.match(/^(\d+)\s+BUILT\s+(\$\S+)\s+(.*)$/);
		if (!m) continue;
		const [, id, path, rest] = m;
		if (!/PURPOSE=GENERAL/.test(rest)) continue;

		const hops = path.split(',').map((seg) => {
			const hm = seg.match(/^\$([0-9A-Fa-f]+)(?:~(.+))?$/);
			return { fingerprint: hm?.[1] ?? seg.replace(/^\$/, ''), nickname: hm?.[2] ?? '' };
		});
		if (hops.length < 2) continue;

		const tm = rest.match(/TIME_CREATED=(\S+)/);
		const created = tm ? Date.parse(tm[1]) : 0;
		circuits.push({ id, hops, created });
	}

	if (circuits.length === 0) return null;

	// Newest qualifying circuit.
	circuits.sort((a, b) => b.created - a.created);
	const chosen = circuits[0];

	// Resolve each hop's IP, then country, in one session.
	const cmds: string[] = [];
	for (const hop of chosen.hops) cmds.push(`GETINFO ns/id/${hop.fingerprint}`);

	let nsReplies: string[] = [];
	try {
		nsReplies = await controlSession(cmds);
	} catch {
		nsReplies = [];
	}

	const ips: (string | null)[] = [];
	const resolvedNicks: (string | null)[] = [];
	for (let i = 0; i < chosen.hops.length; i++) {
		const parsed = nsReplies[i] ? parseNsReply(nsReplies[i]) : { nickname: null, ip: null };
		ips.push(parsed.ip);
		resolvedNicks.push(parsed.nickname);
	}

	// Country lookups (best-effort).
	const countryCmds = ips.filter((ip): ip is string => !!ip).map((ip) => `GETINFO ip-to-country/${ip}`);
	let countryReplies: string[] = [];
	if (countryCmds.length) {
		try {
			countryReplies = await controlSession(countryCmds);
		} catch {
			countryReplies = [];
		}
	}
	const countryByIp = new Map<string, string | null>();
	let ci = 0;
	for (const ip of ips) {
		if (!ip) continue;
		const reply = countryReplies[ci++];
		countryByIp.set(ip, reply ? parseCountryReply(reply, ip) : null);
	}

	const total = chosen.hops.length;
	const hops: TorHop[] = chosen.hops.map((hop, i) => ({
		position: i,
		role: roleFor(i, total),
		nickname: hop.nickname || resolvedNicks[i] || 'unknown',
		fingerprint: hop.fingerprint,
		ip: ips[i],
		country: ips[i] ? (countryByIp.get(ips[i] as string) ?? null) : null
	}));

	return { id: chosen.id, hops };
}
