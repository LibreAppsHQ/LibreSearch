export const DEFAULT_LOGO_SIZE = 'h-16 w-16';

export type Engine = { name: string; logo: string; accent?: boolean; size?: string };

export const engines: readonly Engine[] = [
	{ name: 'LibreSearch', logo: '/2.svg', accent: true },
	{ name: 'Google', logo: '/google.png' },
	{ name: 'Bing', logo: '/bing.png', size: 'h-14 w-28' },
	{ name: 'DuckDuckGo', logo: '/ddg.svg' },
	{ name: 'Brave Search', logo: '/brave.png', size: 'h-20 w-20' },
	{ name: 'Startpage', logo: '/startpage.svg' }
];

export type Mark = 'yes' | 'no' | 'partial' | 'na';

export type CompareRow = { label: string; note?: string; values: Mark[] };

export const compareSections: Array<{ title: string; rows: CompareRow[] }> = [
	{
		title: 'Privacy',
		rows: [
			{
				label: 'No personal data logged',
				note: 'No queries tied to your IP, no session profile.',
				values: ['yes', 'no', 'no', 'yes', 'yes', 'yes']
			},
			{
				label: 'No personalized ads',
				values: ['yes', 'no', 'no', 'yes', 'yes', 'yes']
			},
			{
				label: 'No filter bubble',
				note: 'Two people get the same results for the same query.',
				values: ['yes', 'no', 'no', 'yes', 'yes', 'yes']
			},
			{
				label: 'Works without an account',
				values: ['yes', 'yes', 'yes', 'yes', 'yes', 'yes']
			},
			{
				label: 'No third-party trackers on results page',
				values: ['yes', 'no', 'no', 'yes', 'yes', 'yes']
			}
		]
	},
	{
		title: 'Features',
		rows: [
			{
				label: '!bang shortcuts (!g, !w, !yt …)',
				values: ['yes', 'no', 'no', 'yes', 'yes', 'no']
			},
			{
				label: 'Inline image preview panel',
				values: ['yes', 'yes', 'yes', 'yes', 'yes', 'yes']
			},
			{
				label: 'Built-in video player',
				note: 'Watch results without leaving the site.',
				values: ['yes', 'no', 'yes', 'yes', 'no', 'no']
			},
			{
				label: 'Ad / tracker domain blocklists at search time',
				values: ['yes', 'no', 'no', 'no', 'no', 'no']
			},
			{
				label: 'Built-in maps tab',
				values: ['yes', 'yes', 'yes', 'yes', 'no', 'yes']
			},
			{
				label: 'Knowledge / overview panel',
				values: ['yes', 'yes', 'yes', 'yes', 'yes', 'yes']
			}
		]
	},
	{
		title: 'Under the hood',
		rows: [
			{
				label: 'Independent web index',
				note: 'Crawls and ranks the web itself.',
				values: ['na', 'yes', 'yes', 'na', 'yes', 'na']
			},
			{
				label: 'Open-source UI',
				values: ['yes', 'no', 'no', 'no', 'partial', 'no']
			},
			{
				label: 'No required JavaScript fallback',
				values: ['partial', 'no', 'no', 'yes', 'no', 'yes']
			}
		]
	}
];

export const markStyles: Record<Mark, { icon: string; color: string; label: string }> = {
	yes: { icon: 'fa-check', color: 'text-emerald-400', label: 'Yes' },
	no: { icon: 'fa-xmark', color: 'text-red-400/70', label: 'No' },
	partial: { icon: 'fa-circle-half-stroke', color: 'text-amber-400', label: 'Partial' },
	na: { icon: 'fa-minus', color: 'text-(--app-muted)', label: 'Not applicable' }
};
