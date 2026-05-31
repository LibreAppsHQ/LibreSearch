// Blog content lives here as structured data so both the index (/blog) and the
// individual post pages (/blog/[slug]) read from a single source of truth.
//
// `body` is trusted, hand-authored HTML rendered with {@html}. Keep it to plain
// semantic tags (h2/h3, p, ul/ol/li, a, strong, em, blockquote, code) - the
// prose styles in the post page only target those. Never interpolate untrusted
// input here.

export type Category = 'privacy' | 'security' | 'product';

export type Post = {
	slug: string;
	title: string;
	description: string;
	date: string; // ISO yyyy-mm-dd
	readingMinutes: number;
	category: Category;
	author: string;
	body: string;
};

export const categoryMeta: Record<Category, { label: string; fg: string; bg: string }> = {
	privacy: { label: 'Privacy', fg: 'text-emerald-400', bg: 'bg-emerald-500/15' },
	security: { label: 'Security', fg: 'text-rose-400', bg: 'bg-rose-500/15' },
	product: { label: 'Product', fg: 'text-[var(--app-accent)]', bg: 'bg-[var(--app-accent)]/15' }
};

export const posts: Post[] = [
	{
		slug: 'what-your-search-engine-knows-about-you',
		title: 'What your search engine knows about you',
		description:
			'Every query you type is a confession. Here is exactly what mainstream search engines record, how they tie it to you, and why "anonymized" rarely means anonymous.',
		date: '2026-05-29',
		readingMinutes: 6,
		category: 'privacy',
		author: 'LibreSearch Team',
		body: `
<p>Search is the most intimate thing you do online. You ask a search box things you would never say out loud - about your health, your money, your relationships, your fears. Over a year, your search history is a more honest diary than anything you would ever write down.</p>

<p>So it is worth asking, plainly: what does a typical search engine actually keep?</p>

<h2>The record behind the results</h2>
<p>When you run a search on most large engines, a row gets written somewhere. That row usually contains far more than the words you typed:</p>
<ul>
<li><strong>The query itself</strong>, with a precise timestamp.</li>
<li><strong>Your IP address</strong>, which maps to a rough location and, often, a single household or device.</li>
<li><strong>A cookie or account ID</strong> that links this search to every other search you have ever made.</li>
<li><strong>Your user agent</strong> - browser, version, operating system, language, screen size - which together form a surprisingly unique fingerprint.</li>
<li><strong>Which results you clicked</strong>, and how long before you came back.</li>
</ul>
<p>Individually these feel harmless. Joined together, keyed to one identity, they become a behavioral profile that updates in real time.</p>

<h2>"Anonymized" is doing a lot of work</h2>
<p>Companies love the word <em>anonymized</em>. In practice it often means "we removed your name and kept everything else." But research has shown again and again that a handful of data points - a ZIP code, a birth date, a few distinctive queries - are enough to re-identify a specific person out of millions.</p>
<blockquote>The famous lesson from the 2006 AOL search-log release: queries alone, with no names attached, were enough for journalists to knock on a real person's door.</blockquote>
<p>The only search data that cannot leak is the search data that was never stored.</p>

<h2>Why the profile exists at all</h2>
<p>None of this is an accident or an oversight. The profile <em>is</em> the product. Targeted advertising pays for free search, and better targeting needs richer profiles. The incentive runs in exactly one direction: collect more, keep it longer, connect it to more of your life.</p>

<h2>How LibreSearch is different</h2>
<p>We took the opposite default. There is no row to write because there is no logging pipeline behind it:</p>
<ul>
<li><strong>Queries are never logged</strong> to a per-user history on our servers.</li>
<li><strong>Your search is proxied</strong> to the upstream index, so that index never sees your IP, cookies, or fingerprint.</li>
<li><strong>Your settings and history live in your browser</strong>, not in an account we hold.</li>
</ul>
<p>The point is not to ask you to trust a promise. It is to remove the data that a promise would have to protect.</p>
`
	},
	{
		slug: 'proof-of-work-instead-of-captchas',
		title: 'Why we use proof-of-work instead of CAPTCHAs',
		description:
			'CAPTCHAs quietly track you while wasting your time. Here is how a privacy-preserving proof-of-work challenge keeps bots out without watching a single human.',
		date: '2026-05-24',
		readingMinutes: 5,
		category: 'security',
		author: 'LibreSearch Team',
		body: `
<p>Every search engine has the same problem: scrapers and bots want your results, at scale, for free. If you do nothing, automated traffic drowns out real people and the bill becomes unsustainable. The usual answer is the CAPTCHA. We deliberately did not choose it.</p>

<h2>The hidden cost of "prove you're human"</h2>
<p>Modern CAPTCHAs do not really test whether you can read squiggly text. The hard ones score you in the background using signals like:</p>
<ul>
<li>Your mouse movement and timing.</li>
<li>Cookies and your history with the CAPTCHA vendor across the whole web.</li>
<li>Your browser fingerprint and reputation.</li>
</ul>
<p>In other words, the "are you human" check is itself a tracking system. It works precisely because it has watched you on thousands of other sites. For a product whose entire premise is <em>not</em> tracking you, embedding one would be a contradiction.</p>

<h2>Proof-of-work, briefly</h2>
<p>Instead we use <strong>Altcha</strong>, a proof-of-work challenge. The idea is simple:</p>
<ol>
<li>Our server hands your browser a small math puzzle.</li>
<li>Your browser spends a tiny amount of CPU time solving it - typically imperceptible to you.</li>
<li>It returns the answer, which our server can verify instantly.</li>
</ol>
<p>For one human doing one search, the cost is a few milliseconds you will never notice. For a bot trying to do this millions of times per hour, that cost stacks up into a real, economic wall. The asymmetry does the defending.</p>

<h2>What it does <em>not</em> do</h2>
<p>This is the part that matters for privacy:</p>
<ul>
<li><strong>No third-party cookies.</strong> The challenge is between your browser and us.</li>
<li><strong>No behavioral tracking.</strong> We do not score your mouse, your typing, or your reputation.</li>
<li><strong>No cross-site identity.</strong> Solving the puzzle tells us nothing about who you are.</li>
</ul>
<p>You prove you spent a little work, not that you are a particular person. Bots get priced out; humans get left alone. That trade is the whole point.</p>
`
	},
	{
		slug: 'local-first-settings',
		title: 'Local-first: why your settings never touch our servers',
		description:
			'Your themes, filters, and search history live in your browser, not in an account we hold. Here is what local-first means and why it is the safer default.',
		date: '2026-05-18',
		readingMinutes: 4,
		category: 'product',
		author: 'LibreSearch Team',
		body: `
<p>Most services ask you to make an account so your preferences "follow you everywhere." The unspoken trade is that those preferences now live on their servers, attached to an identity, indefinitely. LibreSearch is built the other way around.</p>

<h2>Where your data actually lives</h2>
<p>Your themes, your region and freshness filters, your safe-search choice, and your recent searches are all stored <strong>locally in your own browser</strong>. They are written to local storage on your device and read straight back from it. They are never uploaded to us, because there is no account to upload them to.</p>

<h2>What that buys you</h2>
<ul>
<li><strong>Nothing to breach.</strong> A server we do not hold cannot leak your history in a data breach.</li>
<li><strong>Nothing to subpoena.</strong> We cannot hand over preference data we never received.</li>
<li><strong>Instant clearing.</strong> Wiping your history is a local action, not a request we have to honor on our end.</li>
<li><strong>No lock-in.</strong> You are not logged into anything, so there is nothing to be logged out of.</li>
</ul>

<h2>The honest trade-off</h2>
<p>Local-first is not magic, and we would rather be straight with you about the cost: your settings do not automatically sync across devices, and clearing your browser data clears them. That is the direct consequence of us never holding them.</p>
<blockquote>We think that is the right default for a privacy tool. The convenience of cross-device sync is real, but it is not worth turning your preferences into a profile on our servers.</blockquote>
<p>If we ever offer sync, it will be opt-in and end-to-end encrypted, so that even then the data stays unreadable to us. The baseline, though, stays the same: by default, your search life belongs on your device.</p>
`
	},
	{
		slug: 'strip-tracking-parameters',
		title: 'The tracking parameters hiding in your links',
		description:
			'That "?utm_source=..." tail on a link is a tiny tracking beacon. Here is what those parameters do and how LibreSearch strips them from outbound results.',
		date: '2026-05-12',
		readingMinutes: 5,
		category: 'privacy',
		author: 'LibreSearch Team',
		body: `
<p>Copy a link from almost any website and look closely at the end of it. You will often find a trail of parameters: <code>utm_source</code>, <code>utm_campaign</code>, <code>fbclid</code>, <code>gclid</code>, and others. They are not part of the page you are visiting. They are there to track you.</p>

<h2>What these parameters do</h2>
<p>Each one is a small label attached to your visit:</p>
<ul>
<li><strong>UTM tags</strong> (<code>utm_source</code>, <code>utm_medium</code>, <code>utm_campaign</code>) tell a site's analytics which campaign, email, or post sent you.</li>
<li><strong>Click IDs</strong> (<code>gclid</code>, <code>fbclid</code>, <code>msclkid</code>) tie your visit back to a specific ad click in an advertiser's system, linking the page you land on to your ad profile.</li>
</ul>
<p>On their own they identify a campaign, not always a person. But combined with cookies and fingerprinting on the destination site, they help stitch your journey across the web into one continuous, attributable trail.</p>

<h2>How LibreSearch handles them</h2>
<p>When you click a result, we strip known tracking parameters from the outbound link before you go. You still land on the page you wanted; the page just learns less about how you got there.</p>
<p>This happens quietly and by default. There is nothing to enable, and it does not change the destination - only the metadata riding along with you.</p>

<h2>Doing it yourself</h2>
<p>Even away from LibreSearch, two habits help:</p>
<ol>
<li>When sharing a link, delete everything from the <code>?</code> onward if the page still loads without it. It usually does.</li>
<li>Be suspicious of long, messy URLs in emails and ads - the mess is often the tracking.</li>
</ol>
<p>Small thing, repeated millions of times a day. Cleaning it up is exactly the kind of quiet default a privacy-first product should own so you do not have to think about it.</p>
`
	}
];

export function getPost(slug: string): Post | undefined {
	return posts.find((p) => p.slug === slug);
}

// Newest first, for the index listing.
export const postsByDate = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
