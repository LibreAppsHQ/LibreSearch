<script lang="ts" module>
	// ── Safe math evaluator (no eval/Function — the site CSP forbids them) ──
	const FUNCS: Record<string, (n: number) => number> = {
		sqrt: Math.sqrt,
		cbrt: Math.cbrt,
		abs: Math.abs,
		ln: Math.log,
		log: Math.log10,
		exp: Math.exp,
		sin: Math.sin,
		cos: Math.cos,
		tan: Math.tan,
		asin: Math.asin,
		acos: Math.acos,
		atan: Math.atan,
		round: Math.round,
		floor: Math.floor,
		ceil: Math.ceil
	};
	const CONSTS: Record<string, number> = { pi: Math.PI, e: Math.E, tau: Math.PI * 2 };

	export function evalMath(input: string): number | null {
		const s = input.toLowerCase().replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/');
		if (!s) return null;
		let i = 0;
		const peek = () => s[i];
		const fail = () => {
			throw new Error('parse');
		};
		function parseExpr(): number {
			let v = parseTerm();
			while (peek() === '+' || peek() === '-') {
				const op = s[i++];
				const r = parseTerm();
				v = op === '+' ? v + r : v - r;
			}
			return v;
		}
		function parseTerm(): number {
			let v = parseFactor();
			while (peek() === '*' || peek() === '/' || peek() === '%') {
				const op = s[i++];
				const r = parseFactor();
				v = op === '*' ? v * r : op === '/' ? v / r : v % r;
			}
			return v;
		}
		function parseFactor(): number {
			const base = parseUnary();
			if (peek() === '^') {
				i++;
				return Math.pow(base, parseFactor());
			}
			return base;
		}
		function parseUnary(): number {
			if (peek() === '-') {
				i++;
				return -parseUnary();
			}
			if (peek() === '+') {
				i++;
				return parseUnary();
			}
			return parsePrimary();
		}
		function parsePrimary(): number {
			if (peek() === '(') {
				i++;
				const v = parseExpr();
				if (s[i++] !== ')') fail();
				return v;
			}
			const num = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/.exec(s.slice(i));
			if (num) {
				i += num[0].length;
				return parseFloat(num[0]);
			}
			const id = /^[a-z]+/.exec(s.slice(i));
			if (id) {
				const name = id[0];
				i += name.length;
				if (peek() === '(') {
					i++;
					const arg = parseExpr();
					if (s[i++] !== ')') fail();
					const fn = FUNCS[name];
					if (!fn) fail();
					return fn(arg);
				}
				if (name in CONSTS) return CONSTS[name];
				fail();
			}
			fail();
			return 0;
		}
		try {
			const v = parseExpr();
			if (i !== s.length || !Number.isFinite(v)) return null;
			return v;
		} catch {
			return null;
		}
	}

	// ── Unit conversion ──────────────────────────────────────────────
	const UNIT_FACTORS: Record<string, Record<string, number>> = {
		length: {
			mm: 0.001,
			cm: 0.01,
			m: 1,
			km: 1000,
			in: 0.0254,
			ft: 0.3048,
			yd: 0.9144,
			mi: 1609.344,
			nmi: 1852
		},
		mass: { mg: 0.001, g: 1, kg: 1000, t: 1e6, oz: 28.3495, lb: 453.592, st: 6350.29 },
		volume: {
			ml: 0.001,
			l: 1,
			gal: 3.78541,
			qt: 0.946353,
			pt: 0.473176,
			cup: 0.236588,
			floz: 0.0295735
		},
		data: {
			b: 1,
			kb: 1e3,
			mb: 1e6,
			gb: 1e9,
			tb: 1e12,
			kib: 1024,
			mib: 1048576,
			gib: 1073741824,
			tib: 1099511627776
		},
		speed: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knot: 0.514444, 'ft/s': 0.3048 },
		time: { ms: 0.001, s: 1, min: 60, h: 3600, day: 86400, week: 604800, year: 31557600 }
	};
	const UNIT_ALIASES: Record<string, string> = {
		millimeter: 'mm',
		millimeters: 'mm',
		millimetre: 'mm',
		mm: 'mm',
		centimeter: 'cm',
		centimeters: 'cm',
		cm: 'cm',
		meter: 'm',
		meters: 'm',
		metre: 'm',
		metres: 'm',
		m: 'm',
		kilometer: 'km',
		kilometers: 'km',
		kilometre: 'km',
		km: 'km',
		inch: 'in',
		inches: 'in',
		in: 'in',
		foot: 'ft',
		feet: 'ft',
		ft: 'ft',
		yard: 'yd',
		yards: 'yd',
		yd: 'yd',
		mile: 'mi',
		miles: 'mi',
		mi: 'mi',
		nmi: 'nmi',
		nauticalmile: 'nmi',
		milligram: 'mg',
		milligrams: 'mg',
		mg: 'mg',
		gram: 'g',
		grams: 'g',
		g: 'g',
		kilogram: 'kg',
		kilograms: 'kg',
		kilo: 'kg',
		kilos: 'kg',
		kg: 'kg',
		tonne: 't',
		tonnes: 't',
		ton: 't',
		tons: 't',
		t: 't',
		ounce: 'oz',
		ounces: 'oz',
		oz: 'oz',
		pound: 'lb',
		pounds: 'lb',
		lb: 'lb',
		lbs: 'lb',
		stone: 'st',
		st: 'st',
		milliliter: 'ml',
		milliliters: 'ml',
		millilitre: 'ml',
		ml: 'ml',
		liter: 'l',
		liters: 'l',
		litre: 'l',
		litres: 'l',
		l: 'l',
		gallon: 'gal',
		gallons: 'gal',
		gal: 'gal',
		quart: 'qt',
		quarts: 'qt',
		qt: 'qt',
		pint: 'pt',
		pints: 'pt',
		pt: 'pt',
		cup: 'cup',
		cups: 'cup',
		floz: 'floz',
		fluidounce: 'floz',
		byte: 'b',
		bytes: 'b',
		b: 'b',
		kilobyte: 'kb',
		kilobytes: 'kb',
		kb: 'kb',
		megabyte: 'mb',
		megabytes: 'mb',
		mb: 'mb',
		gigabyte: 'gb',
		gigabytes: 'gb',
		gb: 'gb',
		terabyte: 'tb',
		terabytes: 'tb',
		tb: 'tb',
		kibibyte: 'kib',
		kib: 'kib',
		mebibyte: 'mib',
		mib: 'mib',
		gibibyte: 'gib',
		gib: 'gib',
		tebibyte: 'tib',
		tib: 'tib',
		millisecond: 'ms',
		milliseconds: 'ms',
		ms: 'ms',
		second: 's',
		seconds: 's',
		sec: 's',
		secs: 's',
		s: 's',
		minute: 'min',
		minutes: 'min',
		min: 'min',
		mins: 'min',
		hour: 'h',
		hours: 'h',
		hr: 'h',
		hrs: 'h',
		h: 'h',
		day: 'day',
		days: 'day',
		week: 'week',
		weeks: 'week',
		year: 'year',
		years: 'year',
		yr: 'year',
		yrs: 'year',
		mph: 'mph',
		kmh: 'km/h',
		kph: 'km/h',
		'km/h': 'km/h',
		mps: 'm/s',
		'm/s': 'm/s',
		knot: 'knot',
		knots: 'knot',
		fps: 'ft/s',
		'ft/s': 'ft/s',
		celsius: 'c',
		c: 'c',
		'°c': 'c',
		fahrenheit: 'f',
		f: 'f',
		'°f': 'f',
		kelvin: 'k',
		k: 'k'
	};
	const TEMP = new Set(['c', 'f', 'k']);

	export type UnitResult = {
		value: number;
		from: string;
		to: string;
		result: number;
	};

	export function parseUnit(query: string): UnitResult | null {
		const m = /^([\d.,]+)\s*([a-zµ°/]+)\s+(?:to|in|into)\s+([a-zµ°/]+)$/i.exec(query.trim());
		if (!m) return null;
		const value = parseFloat(m[1].replace(/,/g, ''));
		if (!Number.isFinite(value)) return null;
		const from = UNIT_ALIASES[m[2].toLowerCase()];
		const to = UNIT_ALIASES[m[3].toLowerCase()];
		if (!from || !to) return null;

		if (TEMP.has(from) && TEMP.has(to)) {
			const c = from === 'c' ? value : from === 'f' ? ((value - 32) * 5) / 9 : value - 273.15;
			const result = to === 'c' ? c : to === 'f' ? (c * 9) / 5 + 32 : c + 273.15;
			return { value, from, to, result };
		}
		const dim = Object.values(UNIT_FACTORS).find((d) => from in d && to in d);
		if (!dim) return null;
		return { value, from, to, result: (value * dim[from]) / dim[to] };
	}

	export type AnswerKind =
		| 'calculator'
		| 'password'
		| 'unit'
		| 'color'
		| 'ip'
		| 'coin'
		| 'dice'
		| 'rng'
		| null;

	const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

	export function detectAnswer(query: string): AnswerKind {
		const q = query.trim().toLowerCase();
		if (!q) return null;

		if (
			/password|passwd|passphrase/.test(q) &&
			/generat|random|strong|secure|create|maker|\bgen\b/.test(q)
		)
			return 'password';
		if (q === 'password generator' || q === 'password gen') return 'password';

		if (/\bmy ip\b|ip address|what'?s? my ip|whats my ip/.test(q) || q === 'ip') return 'ip';

		if (
			q === 'color picker' ||
			q === 'colour picker' ||
			q === 'color' ||
			q === 'colour' ||
			HEX_RE.test(q)
		)
			return 'color';

		if (q === 'unit converter' || q === 'unit conversion' || q === 'converter') return 'unit';
		if (parseUnit(query)) return 'unit';

		if (/flip a coin|coin flip|flip coin|heads or tails/.test(q)) return 'coin';
		if (/roll(ing)?\s+(a\s+)?(dice|die|d\d+)|dice roll|roll dice|\bd6\b|\bd20\b/.test(q))
			return 'dice';
		if (/random number|number generator|\brng\b|random number generator/.test(q)) return 'rng';

		if (q === 'calculator' || q === 'calc') return 'calculator';
		if (/[+\-*/%^()×÷]/.test(q) && evalMath(query) !== null) return 'calculator';

		return null;
	}

	export function fmt(n: number): string {
		if (Number.isInteger(n)) return n.toString();
		return parseFloat(n.toPrecision(12)).toString();
	}

	export function secureInt(min: number, max: number): number {
		if (max <= min) return min;
		const range = max - min + 1;
		const buf = new Uint32Array(1);
		crypto.getRandomValues(buf);
		return min + (buf[0] % range);
	}
</script>

<script lang="ts">
	let { query }: { query: string } = $props();

	let kind = $derived(detectAnswer(query));

	// ── Calculator ───────────────────────────────────────────────────
	const calcSeed = $derived(
		kind === 'calculator' && !['calculator', 'calc'].includes(query.trim().toLowerCase())
			? query.trim()
			: ''
	);
	let expr = $state('');
	let lastSeed = $state<string | null>(null);
	$effect(() => {
		if (kind === 'calculator' && calcSeed !== lastSeed) {
			expr = calcSeed;
			lastSeed = calcSeed;
		}
	});
	let calcResult = $derived.by(() => {
		const v = evalMath(expr);
		return v === null ? '' : fmt(v);
	});
	const calcKeys = [
		['C', '(', ')', '÷'],
		['7', '8', '9', '×'],
		['4', '5', '6', '-'],
		['1', '2', '3', '+'],
		['0', '.', '^', '=']
	];
	function onCalcKey(key: string) {
		if (key === 'C') expr = '';
		else if (key === '=') {
			if (calcResult) expr = calcResult;
		} else expr += key;
	}

	// ── Password ─────────────────────────────────────────────────────
	let length = $state(16);
	let useLower = $state(true);
	let useUpper = $state(true);
	let useNumbers = $state(true);
	let useSymbols = $state(true);
	let password = $state('');
	let pwCopied = $state(false);
	const SETS = {
		lower: 'abcdefghijkmnopqrstuvwxyz',
		upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
		numbers: '23456789',
		symbols: '!@#$%^&*()-_=+[]{};:,.?'
	};
	function generate() {
		let pool = '';
		if (useLower) pool += SETS.lower;
		if (useUpper) pool += SETS.upper;
		if (useNumbers) pool += SETS.numbers;
		if (useSymbols) pool += SETS.symbols;
		if (!pool) {
			password = '';
			return;
		}
		const bytes = new Uint32Array(length);
		crypto.getRandomValues(bytes);
		let out = '';
		for (let n = 0; n < length; n++) out += pool[bytes[n] % pool.length];
		password = out;
		pwCopied = false;
	}
	async function copyText(text: string, done: (v: boolean) => void) {
		if (!text) return;
		try {
			await navigator.clipboard.writeText(text);
			done(true);
			setTimeout(() => done(false), 1800);
		} catch {
			done(false);
		}
	}
	const strength = $derived.by(() => {
		let pool = 0;
		if (useLower) pool += 26;
		if (useUpper) pool += 26;
		if (useNumbers) pool += 10;
		if (useSymbols) pool += 22;
		const bits = pool ? length * Math.log2(pool) : 0;
		if (bits < 50) return { label: 'Weak', cls: 'text-red-400', bar: 'w-1/4 bg-red-400' };
		if (bits < 80) return { label: 'Fair', cls: 'text-amber-400', bar: 'w-2/4 bg-amber-400' };
		if (bits < 120)
			return { label: 'Strong', cls: 'text-emerald-400', bar: 'w-3/4 bg-emerald-400' };
		return { label: 'Very strong', cls: 'text-emerald-400', bar: 'w-full bg-emerald-400' };
	});
	$effect(() => {
		if (kind === 'password') {
			void [length, useLower, useUpper, useNumbers, useSymbols];
			generate();
		}
	});

	// ── Unit converter ───────────────────────────────────────────────
	let unit = $derived(parseUnit(query));

	// ── Color ────────────────────────────────────────────────────────
	let color = $state('#4f46e5');
	let colorCopied = $state(false);
	$effect(() => {
		if (kind === 'color' && HEX_RE.test(query.trim())) {
			let h = query.trim().replace('#', '');
			if (h.length === 3)
				h = h
					.split('')
					.map((c) => c + c)
					.join('');
			color = '#' + h.toLowerCase();
		}
	});
	const rgb = $derived.by(() => {
		const h = color.replace('#', '');
		return {
			r: parseInt(h.slice(0, 2), 16),
			g: parseInt(h.slice(2, 4), 16),
			b: parseInt(h.slice(4, 6), 16)
		};
	});
	const hsl = $derived.by(() => {
		const r = rgb.r / 255,
			g = rgb.g / 255,
			b = rgb.b / 255;
		const max = Math.max(r, g, b),
			min = Math.min(r, g, b);
		let h = 0;
		const l = (max + min) / 2;
		const d = max - min;
		const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
		if (d !== 0) {
			if (max === r) h = ((g - b) / d) % 6;
			else if (max === g) h = (b - r) / d + 2;
			else h = (r - g) / d + 4;
			h *= 60;
			if (h < 0) h += 360;
		}
		return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
	});

	// ── IP ───────────────────────────────────────────────────────────
	let ip = $state<string | null>(null);
	let ipLoading = $state(false);
	let ipCopied = $state(false);
	$effect(() => {
		if (kind === 'ip' && ip === null && !ipLoading) {
			ipLoading = true;
			fetch('/api/ip', { headers: { accept: 'application/json' } })
				.then((r) => r.json())
				.then((d) => (ip = d?.ip || 'Unavailable'))
				.catch(() => (ip = 'Unavailable'))
				.finally(() => (ipLoading = false));
		}
	});

	// ── Coin / Dice / Random number ──────────────────────────────────
	let coin = $state('');
	function flipCoin() {
		coin = secureInt(0, 1) === 0 ? 'Heads' : 'Tails';
	}
	let diceSides = $state(6);
	let diceCount = $state(1);
	let diceRolls = $state<number[]>([]);
	function rollDice() {
		diceRolls = Array.from({ length: diceCount }, () => secureInt(1, diceSides));
	}
	let diceSum = $derived(diceRolls.reduce((a, b) => a + b, 0));
	let rngMin = $state(1);
	let rngMax = $state(100);
	let rngValue = $state<number | null>(null);
	function rollRng() {
		const lo = Math.min(rngMin, rngMax);
		const hi = Math.max(rngMin, rngMax);
		rngValue = secureInt(lo, hi);
	}
	$effect(() => {
		if (kind === 'coin' && !coin) flipCoin();
		if (kind === 'dice' && diceRolls.length === 0) rollDice();
		if (kind === 'rng' && rngValue === null) rollRng();
	});

	const titles: Record<string, string> = {
		calculator: 'Calculator',
		password: 'Password generator',
		unit: 'Unit converter',
		color: 'Color picker',
		ip: 'Your IP address',
		coin: 'Coin flip',
		dice: 'Dice roller',
		rng: 'Random number'
	};
</script>

{#if kind}
	<section
		class="mb-6 max-w-2xl overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface)"
	>
		<div
			class="border-b border-(--app-border) px-5 py-2.5 text-xs font-semibold tracking-widest text-(--app-muted) uppercase"
		>
			{titles[kind]}
		</div>

		{#if kind === 'calculator'}
			<div class="p-5">
				<input
					type="text"
					bind:value={expr}
					aria-label="Calculator expression"
					placeholder="Type an expression…"
					class="w-full bg-transparent text-right text-2xl text-(--app-muted) focus:outline-none"
				/>
				<div class="mt-1 text-right text-4xl font-semibold text-(--app-text) tabular-nums">
					{calcResult || '0'}
				</div>
				<div class="mt-4 grid grid-cols-4 gap-2">
					{#each calcKeys as row, i (i)}
						{#each row as key, i (i)}
							<button
								type="button"
								onclick={() => onCalcKey(key)}
								class={key === '='
									? 'flex h-12 items-center justify-center rounded-xl bg-(--app-accent) text-lg font-semibold text-[#111] transition hover:opacity-90'
									: key === 'C'
										? 'flex h-12 items-center justify-center rounded-xl bg-(--app-hover) text-lg font-medium text-red-400 transition hover:opacity-90'
										: 'flex h-12 items-center justify-center rounded-xl bg-(--app-hover) text-lg font-medium text-(--app-text) transition hover:opacity-90'}
							>
								{key}
							</button>
						{/each}
					{/each}
				</div>
			</div>
		{:else if kind === 'password'}
			<div class="p-5">
				<div class="flex items-center gap-2 rounded-xl bg-(--app-hover) px-4 py-3">
					<code class="min-w-0 flex-1 truncate font-mono text-lg text-(--app-text)"
						>{password || '-'}</code
					>
					<button
						type="button"
						aria-label="Regenerate"
						onclick={generate}
						class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-(--app-muted) transition hover:bg-(--app-surface) hover:text-(--app-text)"
					>
						<i class="fa-solid fa-rotate"></i>
					</button>
					<button
						type="button"
						aria-label="Copy password"
						onclick={() => copyText(password, (v) => (pwCopied = v))}
						class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-(--app-muted) transition hover:bg-(--app-surface) hover:text-(--app-text)"
					>
						<i class={pwCopied ? 'fa-solid fa-check text-emerald-400' : 'fa-solid fa-copy'}></i>
					</button>
				</div>
				<div class="mt-3 flex items-center gap-3">
					<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-(--app-hover)">
						<div
							class="h-full rounded-full transition-[width,background-color] {strength.bar}"
						></div>
					</div>
					<span class="text-xs font-medium {strength.cls}">{strength.label}</span>
				</div>
				<div class="mt-5 flex items-center justify-between text-sm">
					<label for="pw-length" class="text-(--app-muted)">Length</label>
					<span class="font-semibold text-(--app-text) tabular-nums">{length}</span>
				</div>
				<input
					id="pw-length"
					type="range"
					min="6"
					max="48"
					bind:value={length}
					class="mt-2 w-full accent-(--app-accent)"
				/>
				<div class="mt-4 grid grid-cols-2 gap-2 text-sm">
					{#each [{ key: 'lower', label: 'Lowercase (a-z)' }, { key: 'upper', label: 'Uppercase (A-Z)' }, { key: 'numbers', label: 'Numbers (0-9)' }, { key: 'symbols', label: 'Symbols (!@#)' }] as opt, i (i)}
						<label
							class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-(--app-hover)"
						>
							<input
								type="checkbox"
								class="accent-(--app-accent)"
								checked={opt.key === 'lower'
									? useLower
									: opt.key === 'upper'
										? useUpper
										: opt.key === 'numbers'
											? useNumbers
											: useSymbols}
								onchange={(e) => {
									const v = (e.currentTarget as HTMLInputElement).checked;
									if (opt.key === 'lower') useLower = v;
									else if (opt.key === 'upper') useUpper = v;
									else if (opt.key === 'numbers') useNumbers = v;
									else useSymbols = v;
								}}
							/>
							<span class="text-(--app-text)">{opt.label}</span>
						</label>
					{/each}
				</div>
			</div>
		{:else if kind === 'unit'}
			<div class="p-5">
				{#if unit}
					<div class="flex items-baseline gap-3">
						<span class="text-2xl text-(--app-muted) tabular-nums"
							>{fmt(unit.value)} {unit.from}</span
						>
						<i class="fa-solid fa-arrow-right text-sm text-(--app-muted)"></i>
					</div>
					<div class="mt-1 text-4xl font-semibold text-(--app-text) tabular-nums">
						{fmt(unit.result)} <span class="text-2xl text-(--app-muted)">{unit.to}</span>
					</div>
				{:else}
					<p class="text-sm text-(--app-muted)">
						Try a conversion like <span class="text-(--app-text)">10 km to miles</span>,
						<span class="text-(--app-text)">100 f to c</span>, or
						<span class="text-(--app-text)">5 gb to mb</span>.
					</p>
				{/if}
			</div>
		{:else if kind === 'color'}
			<div class="flex items-center gap-5 p-5">
				<input
					type="color"
					bind:value={color}
					aria-label="Pick a color"
					class="h-20 w-20 shrink-0 cursor-pointer rounded-xl border border-(--app-border) bg-transparent"
				/>
				<div class="min-w-0 flex-1 space-y-1.5 text-sm">
					{#each [{ label: 'HEX', value: color.toUpperCase() }, { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }, { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` }] as row, i (i)}
						<button
							type="button"
							onclick={() => copyText(row.value, (v) => (colorCopied = v))}
							class="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-(--app-hover)"
						>
							<span class="w-9 shrink-0 text-xs font-semibold text-(--app-muted)">{row.label}</span>
							<code class="flex-1 truncate font-mono text-(--app-text)">{row.value}</code>
							<i class="fa-solid fa-copy text-xs text-(--app-muted)"></i>
						</button>
					{/each}
					{#if colorCopied}
						<p class="px-2 text-xs text-emerald-400">Copied</p>
					{/if}
				</div>
			</div>
		{:else if kind === 'ip'}
			<div class="flex items-center justify-between gap-4 p-5">
				<code class="min-w-0 flex-1 truncate font-mono text-2xl text-(--app-text)">
					{ipLoading ? 'Looking up…' : (ip ?? '')}
				</code>
				{#if ip && ip !== 'Unavailable'}
					<button
						type="button"
						aria-label="Copy IP"
						onclick={() => copyText(ip ?? '', (v) => (ipCopied = v))}
						class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-(--app-muted) transition hover:bg-(--app-hover) hover:text-(--app-text)"
					>
						<i class={ipCopied ? 'fa-solid fa-check text-emerald-400' : 'fa-solid fa-copy'}></i>
					</button>
				{/if}
			</div>
		{:else if kind === 'coin'}
			<div class="flex flex-col items-center gap-4 p-6">
				<div class="text-4xl font-bold text-(--app-text)">{coin}</div>
				<button
					type="button"
					onclick={flipCoin}
					class="rounded-xl bg-(--app-accent) px-6 py-2.5 text-sm font-semibold text-[#111] transition hover:opacity-90"
				>
					Flip again
				</button>
			</div>
		{:else if kind === 'dice'}
			<div class="p-5">
				<div class="flex flex-wrap items-center justify-center gap-3">
					{#each diceRolls as roll, i (i)}
						<div
							class="flex h-14 w-14 items-center justify-center rounded-xl bg-(--app-hover) text-2xl font-bold text-(--app-text)"
						>
							{roll}
						</div>
					{/each}
				</div>
				{#if diceRolls.length > 1}
					<p class="mt-3 text-center text-sm text-(--app-muted)">
						Total: <span class="font-semibold text-(--app-text)">{diceSum}</span>
					</p>
				{/if}
				<div class="mt-5 flex items-center justify-center gap-3 text-sm">
					<label class="flex items-center gap-1.5 text-(--app-muted)">
						Dice
						<input
							type="number"
							min="1"
							max="10"
							bind:value={diceCount}
							class="w-14 rounded-lg bg-(--app-hover) px-2 py-1 text-center text-(--app-text) focus:outline-none"
						/>
					</label>
					<label class="flex items-center gap-1.5 text-(--app-muted)">
						Sides
						<input
							type="number"
							min="2"
							max="100"
							bind:value={diceSides}
							class="w-16 rounded-lg bg-(--app-hover) px-2 py-1 text-center text-(--app-text) focus:outline-none"
						/>
					</label>
					<button
						type="button"
						onclick={rollDice}
						class="rounded-xl bg-(--app-accent) px-5 py-1.5 font-semibold text-[#111] transition hover:opacity-90"
					>
						Roll
					</button>
				</div>
			</div>
		{:else if kind === 'rng'}
			<div class="p-5">
				<div class="text-center text-5xl font-bold text-(--app-text) tabular-nums">
					{rngValue}
				</div>
				<div class="mt-5 flex items-center justify-center gap-3 text-sm">
					<label class="flex items-center gap-1.5 text-(--app-muted)">
						Min
						<input
							type="number"
							bind:value={rngMin}
							class="w-20 rounded-lg bg-(--app-hover) px-2 py-1 text-center text-(--app-text) focus:outline-none"
						/>
					</label>
					<label class="flex items-center gap-1.5 text-(--app-muted)">
						Max
						<input
							type="number"
							bind:value={rngMax}
							class="w-20 rounded-lg bg-(--app-hover) px-2 py-1 text-center text-(--app-text) focus:outline-none"
						/>
					</label>
					<button
						type="button"
						onclick={rollRng}
						class="rounded-xl bg-(--app-accent) px-5 py-1.5 font-semibold text-[#111] transition hover:opacity-90"
					>
						Generate
					</button>
				</div>
			</div>
		{/if}
	</section>
{/if}
