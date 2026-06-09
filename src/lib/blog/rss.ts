import { postsByDate } from '$lib/blog/posts';

function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function buildBlogRssFeed(feedUrl: string, siteOrigin: string): string {
	const items = postsByDate
		.map(
			(post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteOrigin}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteOrigin}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date + 'T12:00:00Z').toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`
		)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LibreSearch Blog</title>
    <link>${siteOrigin}/blog</link>
    <description>Writing on privacy, security, and how LibreSearch is built.</description>
    <language>en</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
}
